import { type BookkeepingConfiguration, BookkeepingStatus as ConfigurationBookkeepingStatus } from '@schemas/features/bookkeeping/bookkeepingConfiguration'
import { type BookkeepingPeriod, BookkeepingPeriodStatus } from '@schemas/features/bookkeeping/bookkeepingPeriods'
import { BookkeepingStatus, type BookkeepingStatusData } from '@schemas/features/bookkeeping/bookkeepingStatus'
import {
  type BusinessTask,
  BusinessTaskStatus,
  TaskUserResponseType,
} from '@schemas/features/bookkeeping/businessTask'
import { type CallBooking, CallBookingPurpose, CallBookingState, CallBookingType } from '@schemas/features/bookkeeping/callBooking'

import { PeriodIdSchema, schema } from '@fixtures/bookkeeping/schema'
import { formatDollars, formatTaskDate } from '@fixtures/bookkeeping/utils'
import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'
import { createGenerator } from '@fixtures/utils/createGenerator'
import { fromMonthIndex, toMonthIndex } from '@fixtures/utils/monthIndex'

const baseBookkeepingStatus: BookkeepingStatusData = {
  status: BookkeepingStatus.NOT_PURCHASED,
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
  onboardingCallCardTitleText: null,
  onboardingCallCardDescriptionText: null,
  onboardingCallCardCoverageText: null,
}

export const { make: makeBookkeepingConfiguration } = createFixtureFactory(baseBookkeepingConfiguration)

const baseCallBooking: CallBooking = {
  id: '00000000-0000-4000-8000-000000000401',
  businessId: '00000000-0000-4000-8000-000000000201',
  externalId: 'calendly-event-1',
  purpose: CallBookingPurpose.BOOKKEEPING_ONBOARDING,
  state: CallBookingState.SCHEDULED,
  callType: CallBookingType.ZOOM,
  eventStartAt: new Date('2025-01-20T15:30:00.000Z'),
  eventEndAt: new Date('2025-01-20T16:00:00.000Z'),
  callLink: new URL('https://zoom.us/j/123456789'),
  cancellationReason: null,
  didAttend: null,
  bookkeeperName: 'Jamie Bookkeeper',
  bookkeeperEmail: 'jamie@layerfi.com',
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  updatedAt: new Date('2025-01-01T00:00:00.000Z'),
}

export const { make: makeCallBooking, makeMany: makeCallBookings } = createFixtureFactory(baseCallBooking)

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
