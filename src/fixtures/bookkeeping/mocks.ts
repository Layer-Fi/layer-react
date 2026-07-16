import { type BookkeepingConfiguration, BookkeepingStatus as ConfigurationBookkeepingStatus } from '@schemas/bookkeepingConfiguration'
import { type BookkeepingPeriod, BookkeepingPeriodStatus } from '@schemas/bookkeepingPeriods'
import { BookkeepingStatus, type BookkeepingStatusData } from '@schemas/bookkeepingStatus'
import {
  type BusinessTask,
  BusinessTaskStatus,
  TaskUserResponseType,
} from '@schemas/businessTasks/businessTask'

import { PeriodIdSchema, schema } from '@fixtures/bookkeeping/schema'
import { formatDollars, formatTaskDate } from '@fixtures/bookkeeping/utils'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'
import { createGenerator } from '@fixtures/utils/createGenerator'
import { fromMonthIndex, toMonthIndex } from '@fixtures/utils/monthIndex'

const baseBookkeepingStatus: BookkeepingStatusData = {
  status: BookkeepingStatus.ACTIVE,
  showEmbeddedOnboarding: false,
  onboardingCallUrl: null,
}

export const { make: makeBookkeepingStatus } = createFixtureFactory(baseBookkeepingStatus)

const baseBookkeepingConfiguration: BookkeepingConfiguration = {
  businessId: '00000000-0000-4000-8000-000000000201',
  bookkeeperId: '00000000-0000-4000-8000-000000000301',
  firstMonthPurchasedDate: new Date('2024-01-01T00:00:00.000Z'),
  onboardingDate: new Date('2024-01-15T00:00:00.000Z'),
  churnedDate: null,
  bookkeepingEndDate: null,
  bookkeepingStatus: ConfigurationBookkeepingStatus.ACTIVE,
  transactionTaggingStrategy: null,
  notes: null,
  onboardingCallUrl: null,
  adhocCallUrl: null,
}

export const { make: makeBookkeepingConfiguration } = createFixtureFactory(baseBookkeepingConfiguration)

const generateTaskSeeds = createGenerator(schema, {
  uniqueBy: [seed => seed.id, seed => seed.day],
})

const generatePeriodIds = createGenerator(PeriodIdSchema)

const periodIdFor = (monthIndex: number) => generatePeriodIds({ numRuns: 1, seed: monthIndex })[0]

const makePeriodTasks = (periodIndex: number, count: number, month: number): BusinessTask[] => {
  if (count === 0) return []

  return generateTaskSeeds({ numRuns: count, seed: periodIndex }).map(({ id, day, amountCents, merchant }) => {
    const date = formatTaskDate(month, day)

    return {
      id,
      status: BusinessTaskStatus.Todo,
      title: `Transaction on ${date}`,
      question: `On ${date}, you spent ${formatDollars(amountCents)} at ${merchant}. `
        + 'Can you tell us a bit more about what this transaction was for?',
      userResponse: null,
      userResponseType: TaskUserResponseType.FreeResponse,
      documents: null,
    }
  })
}

const OPEN_TASK_COUNT_BY_MONTHS_AGO: Record<number, number> = { 1: 3, 3: 1, 5: 2, 8: 1, 10: 1 }

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

export const makeBookkeepingPeriods = (startYear: number): BookkeepingPeriod[] => {
  const now = new Date()
  const start = toMonthIndex(startYear, 1)
  const end = toMonthIndex(now.getFullYear(), now.getMonth() + 1)

  const periods: BookkeepingPeriod[] = []

  for (let cursor = start; cursor <= end; cursor++) {
    const { year, month } = fromMonthIndex(cursor)
    const openTaskCount = openTaskCountFor(end - cursor)

    periods.push({
      id: periodIdFor(cursor),
      month,
      year,
      status: periodStatusFor(end - cursor, openTaskCount),
      tasks: makePeriodTasks(cursor, openTaskCount, month),
    })
  }

  return periods
}
