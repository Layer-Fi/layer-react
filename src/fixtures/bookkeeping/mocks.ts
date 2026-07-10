import { BookkeepingPeriodStatus } from '@schemas/bookkeepingPeriods'
import { BookkeepingStatus, type BookkeepingStatusData } from '@schemas/bookkeepingStatus'
import {
  type BusinessTask,
  BusinessTaskStatus,
  TaskUserResponseType,
} from '@schemas/businessTasks/businessTask'

import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'
import { fromMonthIndex, toMonthIndex } from '@fixtures/utils/monthIndex'

const baseBookkeepingStatus: BookkeepingStatusData = {
  status: BookkeepingStatus.ACTIVE,
  showEmbeddedOnboarding: false,
  onboardingCallUrl: null,
}

export const { make: makeBookkeepingStatus } = createFixtureFactory(baseBookkeepingStatus)

export type BookkeepingPeriodFixture = {
  id: string
  month: number
  year: number
  status: BookkeepingPeriodStatus
  tasks: BusinessTask[]
}

const fixtureUuid = (prefix: number, index: number) =>
  `00000000-0000-4000-8000-${prefix}${index.toString().padStart(11, '0')}`

const makeTask = (periodIndex: number, taskIndex: number, title: string, question: string): BusinessTask => ({
  id: fixtureUuid(taskIndex + 1, periodIndex),
  status: BusinessTaskStatus.Todo,
  title,
  question,
  userResponse: null,
  userResponseType: TaskUserResponseType.FreeResponse,
  documents: null,
})

// Bookkeeper-authored free-response prompts, sampled from realistic copy in the API repo.
const TASK_COPY: ReadonlyArray<readonly [title: string, question: string]> = [
  ['Uncategorized transactions', 'We found transactions we could not categorize. Can you tell us more about them?'],
  ['Categorize this transaction', 'What was this purchase for?'],
  ['Verify duplicate account transaction', 'What was this transaction for?'],
  ['Categorize restaurant transactions', 'What category are these restaurant transactions?'],
  ['Tax document review', 'Review your quarterly tax documents and confirm they look accurate.'],
  ['Monthly expense report', 'Submit your office expenses for this month for approval.'],
  ['Missing bank statement', 'Please upload the statement for your business checking account for this month.'],
  ['Need receipt', 'Please provide documentation for your office supplies purchase.'],
]

const makePeriodTasks = (periodIndex: number, count: number): BusinessTask[] =>
  Array.from({ length: count }, (_, taskIndex) => {
    const [title, question] = TASK_COPY[(periodIndex * 3 + taskIndex) % TASK_COPY.length]
    return makeTask(periodIndex, taskIndex, title, question)
  })

// Months (before the current one) that still have open tasks - a few, clustered recent.
const OPEN_TASK_COUNT_BY_MONTHS_AGO: Record<number, number> = { 1: 2, 3: 1, 4: 2, 7: 1, 10: 1 }

const openTaskCountFor = (monthsAgo: number) => OPEN_TASK_COUNT_BY_MONTHS_AGO[monthsAgo] ?? 0

const monthsBeforeCurrent = (year: number, month: number) => {
  const now = new Date()
  return toMonthIndex(now.getFullYear(), now.getMonth() + 1) - toMonthIndex(year, month)
}

/** Past months without open tasks have closed books, so they carry no uncategorized activity. */
export const hasCompletedBooks = (year: number, month: number) => {
  const monthsAgo = monthsBeforeCurrent(year, month)
  return monthsAgo > 0 && openTaskCountFor(monthsAgo) === 0
}

const periodStatusFor = (monthsAgo: number, openTaskCount: number): BookkeepingPeriodStatus => {
  if (monthsAgo === 0) return BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_BOOKKEEPER
  if (openTaskCount > 0) return BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER
  return BookkeepingPeriodStatus.CLOSED_COMPLETE
}

export const makeBookkeepingPeriods = (startYear: number): BookkeepingPeriodFixture[] => {
  const now = new Date()
  const start = toMonthIndex(startYear, 1)
  const end = toMonthIndex(now.getFullYear(), now.getMonth() + 1)

  const periods: BookkeepingPeriodFixture[] = []

  for (let cursor = start; cursor <= end; cursor++) {
    const { year, month } = fromMonthIndex(cursor)
    const openTaskCount = openTaskCountFor(end - cursor)

    periods.push({
      id: fixtureUuid(0, cursor),
      month,
      year,
      status: periodStatusFor(end - cursor, openTaskCount),
      tasks: makePeriodTasks(cursor, openTaskCount),
    })
  }

  return periods
}
