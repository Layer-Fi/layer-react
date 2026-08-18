import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { withUsageTracking } from '@components/utility/withUsageTracking'

import { post as logComponentUsage } from '@msw/api/businesses/[business-id]/component-usage/post'
import { server } from '@msw/node'
import { readRequestJson } from '@msw/utils/request'
import { LayerTestProvider, TEST_LAYER_BUSINESS_ID } from '@testUtils/render/LayerTestProvider'

type TrackedProps = {
  showTitle?: boolean
  stringOverrides?: { header?: { title?: string } }
}

const Tracked = withUsageTracking('Tasks', ({ showTitle = true }: TrackedProps) => (
  <p>{showTitle ? 'Tasks' : 'Tasks, untitled'}</p>
))

const TrackedParent = withUsageTracking('BookkeepingOverview', ({ children }: { children?: React.ReactNode }) => (
  <section>{children}</section>
))

const spyOnUsageReports = () => {
  const onReport = vi.fn()

  server.use(logComponentUsage.mock({ sampleRate: 1 }, {
    onRequest: async ({ request, params }) => {
      onReport({ body: await readRequestJson(request), businessId: params.businessId })
    },
  }))

  return onReport
}

const renderTracked = (props: TrackedProps = {}) => ({
  onReport: spyOnUsageReports(),
  ...render(<Tracked {...props} />, { wrapper: LayerTestProvider }),
})

describe('withUsageTracking', () => {
  it('renders the wrapped component', async () => {
    renderTracked()

    expect(await screen.findByText('Tasks')).toBeInTheDocument()
  })

  it('reports the props the consumer passed, for the business in context', async () => {
    const { onReport } = renderTracked({
      showTitle: false,
      stringOverrides: { header: { title: 'Your tasks' } },
    })

    await waitFor(() => expect(onReport).toHaveBeenCalledWith({
      businessId: TEST_LAYER_BUSINESS_ID,
      body: {
        component: 'Tasks',
        parent_component: null,
        environment: 'production',
        props: [
          { name: 'showTitle', kind: 'boolean', boolean_value: false },
          { name: 'stringOverrides', kind: 'object', keys: ['header.title'] },
        ],
      },
    }))
  })

  it('does not report a default the consumer never passed', async () => {
    const { onReport } = renderTracked()

    await waitFor(() => expect(onReport).toHaveBeenCalledTimes(1))
    expect(onReport).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.objectContaining({ props: [] }) as object,
    }))
  })

  it('reports a prop combination once, however often the component remounts', async () => {
    const { onReport, unmount } = renderTracked({ showTitle: false })

    await waitFor(() => expect(onReport).toHaveBeenCalledTimes(1))

    unmount()
    render(<Tracked showTitle={false} />, { wrapper: LayerTestProvider })

    expect(await screen.findByText('Tasks, untitled')).toBeInTheDocument()
    expect(onReport).toHaveBeenCalledTimes(1)
  })

  it('reports again for a different prop combination', async () => {
    const onReport = spyOnUsageReports()

    render(
      <>
        <Tracked showTitle={false} />
        <Tracked />
      </>,
      { wrapper: LayerTestProvider },
    )

    await waitFor(() => expect(onReport).toHaveBeenCalledTimes(2))
  })

  it('names the enclosing tracked component, so our own composition is separable', async () => {
    const onReport = spyOnUsageReports()

    render(<TrackedParent><Tracked /></TrackedParent>, { wrapper: LayerTestProvider })

    await waitFor(() => expect(onReport).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.objectContaining({ component: 'Tasks', parent_component: 'BookkeepingOverview' }) as object,
    })))
  })

  it('keeps a failed report away from the consumer error handler', async () => {
    const onError = vi.fn()
    server.use(logComponentUsage.mockError({ errors: [] }))

    render(<Tracked />, { wrapper: ({ children }) => (
      <LayerTestProvider onError={onError}>{children}</LayerTestProvider>
    ) })

    expect(await screen.findByText('Tasks')).toBeInTheDocument()
    expect(onError).not.toHaveBeenCalled()
  })
})
