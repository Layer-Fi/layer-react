import { waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { useGetBookkeepingPeriods } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { get as getBookkeepingPeriods } from '@msw/api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'
import { bookkeepingPeriodStore } from '@msw/api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/store'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { server } from '@msw/node'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'

const mockActiveBookkeeping = () => {
  server.use(
    getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })),
  )
}

const spyOnPeriodsRequest = () => {
  const onRequest = vi.fn<(url: string) => void>()

  server.use(
    getBookkeepingPeriods.mock(bookkeepingPeriodStore.all(), {
      onRequest: ({ request }) => {
        onRequest(request.url)
      },
    }),
  )

  return onRequest
}

describe('useGetBookkeepingPeriods', () => {
  it('requests the unified tasks route with the form version', async () => {
    mockActiveBookkeeping()
    const onRequest = spyOnPeriodsRequest()

    await renderHookWithAuth(() => useGetBookkeepingPeriods())

    await waitFor(() => expect(onRequest).toHaveBeenCalled())
    expect(onRequest.mock.calls[0]?.[0]).toContain('/bookkeeping/periods-with-unified-tasks?form_version=1')
  })
})
