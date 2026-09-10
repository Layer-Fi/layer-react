import { waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { isCounterpartyAskTask } from '@schemas/features/bookkeeping/businessTask'
import { useGetBookkeepingPeriods } from '@api/businesses/[business-id]/bookkeeping/periods/get'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { get as getBookkeepingPeriods } from '@msw/api/businesses/[business-id]/bookkeeping/periods/get'
import { bookkeepingPeriodStore } from '@msw/api/businesses/[business-id]/bookkeeping/periods/store'
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
  it('opts out of legacy_tasks_only so counterparty asks are included', async () => {
    mockActiveBookkeeping()
    const onRequest = spyOnPeriodsRequest()

    await renderHookWithAuth(() => useGetBookkeepingPeriods())

    await waitFor(() => expect(onRequest).toHaveBeenCalled())
    expect(onRequest.mock.calls[0]?.[0]).toContain('legacy_tasks_only=false')
  })

  it('returns the counterparty asks the seeded periods carry', async () => {
    mockActiveBookkeeping()

    const { result } = await renderHookWithAuth(() => useGetBookkeepingPeriods())

    await waitFor(() => expect(result.current.data).toBeDefined())

    const asks = (result.current.data ?? [])
      .flatMap(period => period.tasks)
      .filter(task => isCounterpartyAskTask(task))

    expect(asks.length).toBeGreaterThan(0)
  })
})
