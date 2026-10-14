import { act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { type BookkeepingPeriod, BookkeepingPeriodStatus } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { useRefreshTasksAfterAccountLinked } from '@providers/features/bookkeeping/BookkeepingPeriodsRefresh/BookkeepingPeriodsRefreshProvider'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { makeUnifiedAskFormTask } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { get as getBookkeepingPeriods } from '@msw/api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { server } from '@msw/node'
import { renderHookWithAuth } from '@testUtils/render/renderHookWithAuth'

const periodWithTaskIn = (status: BusinessTaskStatus): BookkeepingPeriod => ({
  id: 'period-1',
  year: 2025,
  month: 2,
  status: BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER,
  tasks: [makeUnifiedAskFormTask({ status })],
})

const servePeriods = (status: BusinessTaskStatus, onRequest: () => void) => {
  server.use(getBookkeepingPeriods.mock([periodWithTaskIn(status)], { onRequest }))
}

const renderRefresh = async () => {
  server.use(getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })))
  const view = await renderHookWithAuth(() => useRefreshTasksAfterAccountLinked())
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })

  return view
}

afterEach(() => {
  vi.useRealTimers()
})

describe('BookkeepingPeriodsRefreshProvider', () => {
  it('fetches nothing until polling starts', async () => {
    const onPeriodsRequest = vi.fn()
    servePeriods(BusinessTaskStatus.Todo, onPeriodsRequest)
    await renderRefresh()

    await vi.advanceTimersByTimeAsync(30_000)

    expect(onPeriodsRequest).not.toHaveBeenCalled()
  })

  it('refetches every 5 seconds while a task is open and stops once none are', async () => {
    const onPeriodsRequest = vi.fn()
    servePeriods(BusinessTaskStatus.Todo, onPeriodsRequest)
    const { result } = await renderRefresh()

    act(() => result.current())
    await vi.advanceTimersByTimeAsync(0)
    expect(onPeriodsRequest).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(5_000)
    expect(onPeriodsRequest).toHaveBeenCalledTimes(2)

    servePeriods(BusinessTaskStatus.UserMarkedCompleted, onPeriodsRequest)
    await vi.advanceTimersByTimeAsync(5_000)
    expect(onPeriodsRequest).toHaveBeenCalledTimes(3)

    await vi.advanceTimersByTimeAsync(60_000)
    expect(onPeriodsRequest).toHaveBeenCalledTimes(3)
  })

  it('stops refetching two minutes after polling starts, and restarts on the next link', async () => {
    const onPeriodsRequest = vi.fn()
    servePeriods(BusinessTaskStatus.Todo, onPeriodsRequest)
    const { result } = await renderRefresh()

    act(() => result.current())
    await vi.advanceTimersByTimeAsync(2 * 60 * 1000 + 5_000)
    expect(onPeriodsRequest).toHaveBeenCalledTimes(25)

    await vi.advanceTimersByTimeAsync(60_000)
    expect(onPeriodsRequest).toHaveBeenCalledTimes(25)

    act(() => result.current())
    await vi.advanceTimersByTimeAsync(10_000)
    expect(onPeriodsRequest).toHaveBeenCalledTimes(27)
  })
})
