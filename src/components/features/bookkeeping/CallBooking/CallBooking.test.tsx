import { type PropsWithChildren } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { type LayerEvent, LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { CallBookingPurpose, CallBookingType } from '@schemas/features/bookkeeping/callBooking'
import { CallBooking, type CallBookingProps } from '@features/bookkeeping/CallBooking/CallBooking'

import { makeCallBooking } from '@fixtures/bookkeeping/mocks'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

const MOCK_ONBOARDING_CALL_BOOKING = makeCallBooking()

const MOCK_ADHOC_CALL_BOOKING = makeCallBooking({
  purpose: CallBookingPurpose.ADHOC,
  callType: CallBookingType.GOOGLE_MEET,
})

const renderCallBooking = (props: Partial<CallBookingProps> = {}, onEvent?: (event: LayerEvent) => void) => {
  const user = userEvent.setup()

  const wrapper = ({ children }: PropsWithChildren) => (
    <LayerTestProvider eventCallbacks={onEvent ? { onEvent } : undefined}>{children}</LayerTestProvider>
  )

  return {
    user,
    ...render(<CallBooking {...props} />, { wrapper }),
  }
}

describe('CallBooking', () => {
  it('renders the empty state and emits an event when scheduling a call', async () => {
    const onBookCall = vi.fn()
    const onEvent = vi.fn<(event: LayerEvent) => void>()
    const { user } = renderCallBooking({ onBookCall }, onEvent)

    expect(screen.getByRole('heading', { name: 'Ready to get started?' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Schedule a call' }))

    expect(onBookCall).toHaveBeenCalledTimes(1)
    expect(onEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: LayerEventType.BookkeepingScheduleCallClicked,
        version: 1,
        payload: {},
        metadata: expect.objectContaining({ component: LayerEventComponent.BookkeepingOverview }) as object,
      }),
    )
  })

  it('renders empty-state string overrides when provided', () => {
    renderCallBooking({
      stringOverrides: {
        title: 'Custom title',
        description: 'Custom description',
      },
    })

    expect(screen.getByRole('heading', { name: 'Custom title' })).toBeInTheDocument()
    expect(screen.getByText('Custom description')).toBeInTheDocument()
  })

  it('renders onboarding call details, coverage list, and a join link', () => {
    renderCallBooking({ callBooking: MOCK_ONBOARDING_CALL_BOOKING })

    expect(screen.getByRole('heading', { name: 'Onboarding call' })).toBeInTheDocument()
    expect(screen.getByText('Meet with our bookkeeping team')).toBeInTheDocument()
    expect(screen.getByText('Zoom')).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()

    const coverageItems = screen.getAllByRole('listitem')
    expect(coverageItems).toHaveLength(3)
    expect(coverageItems[0]).toHaveTextContent('Introduce your bookkeeper')
    expect(coverageItems[1]).toHaveTextContent('Walk through our bookkeeping process')
    expect(coverageItems[2]).toHaveTextContent('Connect your business bank accounts and credit cards')

    const joinLink = screen.getByRole('link', { name: /join call/i })
    expect(joinLink).toHaveAttribute('href', MOCK_ONBOARDING_CALL_BOOKING.callLink.toString())
  })

  it('renders ad hoc call details without the onboarding coverage list', () => {
    renderCallBooking({ callBooking: MOCK_ADHOC_CALL_BOOKING })

    expect(screen.getByRole('heading', { name: 'Ad hoc call' })).toBeInTheDocument()
    expect(screen.getByText('Google Meet')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it('uses the custom onboarding title, description, and coverage string overrides', () => {
    renderCallBooking({
      callBooking: MOCK_ONBOARDING_CALL_BOOKING,
      stringOverrides: {
        title: 'Custom onboarding title',
        description: 'Custom onboarding description',
        coverage: 'Custom coverage summary',
      },
    })

    expect(screen.getByRole('heading', { name: 'Custom onboarding title' })).toBeInTheDocument()
    expect(screen.getByText('Custom onboarding description')).toBeInTheDocument()
    expect(screen.getByText('Custom coverage summary')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
