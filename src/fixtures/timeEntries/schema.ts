import { Arbitrary, Schema } from 'effect'

import { TimeEntrySchema } from '@schemas/timeTracking'

import { makeBusiness } from '@fixtures/business/mocks'
import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import {
  billableArbitrary,
  durationMinutesArbitrary,
  timeEntryCustomerArbitrary,
  timeEntryServiceArbitrary,
} from '@fixtures/timeEntries/arbitrary'
import { timeEntryDescriptions, timeEntryMemos } from '@fixtures/timeEntries/constants'
import { calendarDateArbitrary } from '@fixtures/utils/arbitrary/calendarDate'
import { dateArbitrary } from '@fixtures/utils/arbitrary/date'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'
import { nullableConstantFrom } from '@fixtures/utils/arbitrary/nullableConstantFrom'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'

const BUSINESS_ID = makeBusiness().id

const fields = TimeEntrySchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.timeEntry)),
  businessId: withArbitrary(fields.businessId, () => fc => fc.constant(BUSINESS_ID)),
  externalId: withArbitrary(fields.externalId, () => fc => fc.constant(null)),
  date: withArbitrary(fields.date, () => calendarDateArbitrary(FIXTURE_YEAR)),
  durationMinutes: withArbitrary(fields.durationMinutes, () => durationMinutesArbitrary),
  billable: withArbitrary(fields.billable, () => billableArbitrary),
  description: withArbitrary(fields.description, () =>
    nullableConstantFrom(timeEntryDescriptions, { nullWeight: 1, valueWeight: 3 })),
  memo: withArbitrary(fields.memo, () =>
    nullableConstantFrom(timeEntryMemos, { nullWeight: 3, valueWeight: 1 })),
  metadata: withArbitrary(fields.metadata, () => fc => fc.constant(null)),
  customer: withArbitrary(fields.customer, () => timeEntryCustomerArbitrary),
  service: withArbitrary(fields.service, () => timeEntryServiceArbitrary),
  invoiceLineItem: withArbitrary(fields.invoiceLineItem, () => fc => fc.constant(null)),
  stoppedAt: withArbitrary(fields.stoppedAt, () => fc => fc.constant(null)),
  createdAt: withArbitrary(fields.createdAt, () => dateArbitrary),
  updatedAt: withArbitrary(fields.updatedAt, () => dateArbitrary),
  deletedAt: withArbitrary(fields.deletedAt, () => fc => fc.constant(null)),
})

const baseArbitrary = Arbitrary.make(base)

export const TimeEntryArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((entry): typeof base.Type => {
      const [createdAt, updatedAt] = [entry.createdAt, entry.updatedAt].sort((a, b) => a.getTime() - b.getTime())

      const status = entry.status === 'COMPLETED' ? 'COMPLETED' : 'RECORDED'

      return { ...entry, createdAt, updatedAt, status }
    }),
})

export const schema = TimeEntryArbitrarySchema
