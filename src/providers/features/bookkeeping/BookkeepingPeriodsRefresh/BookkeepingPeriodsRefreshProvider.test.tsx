import { act, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { type BookkeepingPeriod, BookkeepingPeriodStatus } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { useBookkeepingPeriodsGlobalCacheActions } from '@api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { makeUnifiedAskFormTask } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { get as getBookkeepingPeriods } from '@msw/api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { server } from '@msw/node'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'

const periodWithConnectTask = (connectionMatchPending: boolean): BookkeepingPeriod => ({
  id: 'period-1',
  year: 2025,
  month: 2,
  status: BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER,
  tasks: [makeUnifiedAskFormTask({ discoveredAccount: { id: 'discovered-1', connectionMatchPending } })],
})

const servePeriods = (connectionMatchPending: boolean, onRequest: () => void) => {
  server.use(getBookkeepingPeriods.mock([periodWithConnectTask(connectionMatchPending)], { onRequest }))
}

const renderPoller = async (onRequest: () => void) => {
  server.use(getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })))
  servePeriods(false, onRequest)
  const view = await renderHookWithAuth(() => useBookkeepingPeriodsGlobalCacheActions())
  await waitFor(() => expect(onRequest).toHaveBeenCalledTimes(1))
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'Date'] })

  return view
}

afterEach(() => {
  vi.useRealTimers()
})

describe('BookkeepingPeriodsRefreshProvider', () => {
  it('fetches the periods once and does not poll while no connection match is pending', async () => {
    const onPeriodsRequest = vi.fn()
    await renderPoller(onPeriodsRequest)

    await vi.advanceTimersByTimeAsync(60_000)

    expect(onPeriodsRequest).toHaveBeenCalledTimes(1)
  })

  it('polls every 5 seconds once a refetch reports a pending match, and stops when it clears', async () => {
    const onPeriodsRequest = vi.fn()
    const { result } = await renderPoller(onPeriodsRequest)

    servePeriods(true, onPeriodsRequest)
    act(() => void result.current.invalidate())
    await vi.advanceTimersByTimeAsync(0)
    expect(onPeriodsRequest).toHaveBeenCalledTimes(2)

    await vi.advanceTimersByTimeAsync(5_000)
    expect(onPeriodsRequest).toHaveBeenCalledTimes(3)

    servePeriods(false, onPeriodsRequest)
    await vi.advanceTimersByTimeAsync(5_000)
    expect(onPeriodsRequest).toHaveBeenCalledTimes(4)

    await vi.advanceTimersByTimeAsync(60_000)
    expect(onPeriodsRequest).toHaveBeenCalledTimes(4)
  })

  it('stops polling two minutes after a match is first reported pending', async () => {
    const onPeriodsRequest = vi.fn()
    const { result } = await renderPoller(onPeriodsRequest)

    servePeriods(true, onPeriodsRequest)
    act(() => void result.current.invalidate())
    await vi.advanceTimersByTimeAsync(2 * 60 * 1000 + 5_000)
    expect(onPeriodsRequest).toHaveBeenCalledTimes(26)

    await vi.advanceTimersByTimeAsync(60_000)
    expect(onPeriodsRequest).toHaveBeenCalledTimes(26)
  })
})
