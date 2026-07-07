import { Arbitrary, Schema } from 'effect'

import { TimeEntrySchema } from '@schemas/timeTracking'

import { makeBusiness } from '@fixtures/business/mocks'
import { timeEntryDescriptions } from '@fixtures/constants/timeTracking/timeEntryDescriptions'
import { timeEntryMemos } from '@fixtures/constants/timeTracking/timeEntryMemos'
import { catalogServices as servicePool } from '@fixtures/generated/catalogServices.gen'
import { customers as customerPool } from '@fixtures/generated/customers.gen'
import { calendarDateArbitrary } from '@fixtures/utils/calendarDateArbitrary'
import { dateArbitrary } from '@fixtures/utils/dateArbitrary'
import { externalIdArbitrary } from '@fixtures/utils/externalIdArbitrary'
import { nullableConstantFrom } from '@fixtures/utils/nullableConstantFromArbitrary'
import { withArbitrary } from '@fixtures/utils/withArbitrary'

const BUSINESS_ID = makeBusiness().id
const FIXTURE_YEAR = 2025

const COMMON_DURATIONS_MINUTES = [15, 30, 45, 60, 90, 120, 180, 240, 300, 480]

const timeEntryServices = servicePool
  .filter(service => service.archivedAt == null)
  .map(service => ({
    id: service.id,
    name: service.name,
    billableRatePerHourAmount: service.billableRatePerHourAmount,
  }))

const fields = TimeEntrySchema.fields

const base = Schema.Struct({
  ...fields,
  businessId: withArbitrary(fields.businessId, () => fc => fc.constant(BUSINESS_ID)),
  externalId: withArbitrary(fields.externalId, () => externalIdArbitrary),
  date: withArbitrary(fields.date, () => calendarDateArbitrary(FIXTURE_YEAR)),
  durationMinutes: withArbitrary(fields.durationMinutes, () => fc =>
    fc.constantFrom(...COMMON_DURATIONS_MINUTES)),
  billable: withArbitrary(fields.billable, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(true), weight: 4 },
      { arbitrary: fc.constant(false), weight: 1 },
    )),
  description: withArbitrary(fields.description, () =>
    nullableConstantFrom(timeEntryDescriptions, { nullWeight: 1, valueWeight: 3 })),
  memo: withArbitrary(fields.memo, () =>
    nullableConstantFrom(timeEntryMemos, { nullWeight: 3, valueWeight: 1 })),
  metadata: withArbitrary(fields.metadata, () => fc => fc.constant(null)),
  customer: withArbitrary(fields.customer, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(null), weight: 1 },
      { arbitrary: fc.constantFrom(...customerPool), weight: 3 },
    )),
  service: withArbitrary(fields.service, () => fc => fc.constantFrom(...timeEntryServices)),
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
