import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BookkeepingPeriodStatus } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { BookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingStatus'
import { BusinessTaskStatus } from '@schemas/features/bookkeeping/businessTasks/baseBusinessTask'
import { TasksPending } from '@features/bookkeeping/Tasks/TasksPending'

import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { fixtureId, makeUnifiedAskFormTask } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { get as getBookkeepingPeriods } from '@msw/api/businesses/[business-id]/bookkeeping/periods-with-unified-tasks/get'
import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { server } from '@msw/node'
import { NOW } from '@testUtils/dates/fixedDates'
import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.setSystemTime(NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

const renderTasksPending = (status: BookkeepingPeriodStatus, openTasks = 0) => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

  server.use(
    getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })),
    getBookkeepingPeriods.mock([{
      id: 'period-june',
      year: 2026,
      month: 6,
      status,
      tasks: [
        ...Array.from({ length: openTasks }, (_, index) => makeUnifiedAskFormTask({
          id: fixtureId(String(index)),
          status: BusinessTaskStatus.Todo,
        })),
        makeUnifiedAskFormTask({ id: fixtureId('100'), status: BusinessTaskStatus.Completed }),
        makeUnifiedAskFormTask({ id: fixtureId('101'), status: BusinessTaskStatus.UserMarkedCompleted }),
        makeUnifiedAskFormTask({ id: fixtureId('102'), status: BusinessTaskStatus.Archived }),
      ],
    }]),
  )

  return { user, ...render(<TasksPending />, { wrapper: LayerTestProvider }) }
}

const unfinishedStatuses = [
  BookkeepingPeriodStatus.NOT_STARTED,
  BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER,
  BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER,
  BookkeepingPeriodStatus.CLOSING_OPEN_ITEMS,
  BookkeepingPeriodStatus.CLOSING_IN_REVIEW,
]

describe('TasksPending', () => {
  it.each(unfinishedStatuses)('asks for customer action for %s with open tasks', async (status) => {
    renderTasksPending(status, 2)

    expect(await screen.findByText('Action required')).toBeInTheDocument()
    expect(screen.getByText('Please respond to the below tasks to help us complete your June books.')).toBeInTheDocument()
    expect(screen.queryByText('Books in progress')).not.toBeInTheDocument()
  })

  it.each(unfinishedStatuses)('needs no customer action for %s without open tasks', async (status) => {
    renderTasksPending(status)

    expect(await screen.findByText('Books in progress')).toBeInTheDocument()
    expect(screen.getByText('We’re working on your June books. No action is needed from you right now.')).toBeInTheDocument()
    expect(screen.queryByText('Action required')).not.toBeInTheDocument()
  })

  it.each([
    [1, '1 outstanding task'],
    [2, '2 outstanding tasks'],
  ] as const)('explains provisional completion with %i open tasks', async (count, taskCopy) => {
    renderTasksPending(BookkeepingPeriodStatus.CLOSED_OPEN_TASKS, count)

    expect(await screen.findByText('Action required')).toBeInTheDocument()
    expect(screen.getByText(`We’ve completed your June books and we’ll make final adjustments after you complete ${taskCopy}.`)).toBeInTheDocument()
  })

  it('shows provisionally closed books as completed when no open tasks remain', async () => {
    renderTasksPending(BookkeepingPeriodStatus.CLOSED_OPEN_TASKS)

    expect(await screen.findByText('Books completed')).toBeInTheDocument()
    expect(screen.getByText('Your June books are complete and ready to view!')).toBeInTheDocument()
    expect(screen.queryByText('Action required')).not.toBeInTheDocument()
  })

  it('keeps fully closed books complete even when tasks remain', async () => {
    renderTasksPending(BookkeepingPeriodStatus.CLOSED_COMPLETE, 1)

    expect(await screen.findByText('Books completed')).toBeInTheDocument()
    expect(screen.getByText('Your June books are complete and ready to view!')).toBeInTheDocument()
    expect(screen.queryByText('Action required')).not.toBeInTheDocument()
  })
})
