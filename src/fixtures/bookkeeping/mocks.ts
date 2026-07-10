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

const makePeriodTasks = (periodIndex: number): BusinessTask[] => [
  makeTask(
    periodIndex,
    0,
    'Uncategorized transactions',
    'We found transactions we could not categorize. Can you tell us more about them?',
  ),
  makeTask(
    periodIndex,
    1,
    'Missing bank statement',
    'Please upload the statement for your business checking account for this month.',
  ),
]

export const makeBookkeepingPeriods = (startYear: number): BookkeepingPeriodFixture[] => {
  const now = new Date()
  const start = toMonthIndex(startYear, 1)
  const end = toMonthIndex(now.getFullYear(), now.getMonth() + 1)

  const periods: BookkeepingPeriodFixture[] = []

  for (let cursor = start; cursor <= end; cursor++) {
    const { year, month } = fromMonthIndex(cursor)
    const hasOpenTasks = month % 3 === 0

    periods.push({
      id: fixtureUuid(0, cursor),
      month,
      year,
      status: hasOpenTasks
        ? BookkeepingPeriodStatus.IN_PROGRESS_AWAITING_CUSTOMER
        : BookkeepingPeriodStatus.CLOSED_COMPLETE,
      tasks: hasOpenTasks ? makePeriodTasks(cursor) : [],
    })
  }

  return periods
}
