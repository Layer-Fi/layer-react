import { type FastCheck } from 'effect'

import { catalogServices as servicePool } from '@fixtures/generated/catalogServices.gen'
import { customers as customerPool } from '@fixtures/generated/customers.gen'
import { commonDurationsMinutes, timeEntryDescriptions } from '@fixtures/timeEntries/constants'
import { toTimeEntryService } from '@fixtures/timeEntries/toTimeEntryService'
import { nullableConstantFrom } from '@fixtures/utils/arbitrary/nullableConstantFrom'

const timeEntryServices = servicePool
  .filter(service => service.archivedAt == null)
  .map(toTimeEntryService)

export const durationMinutesArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom(...commonDurationsMinutes)

export const billableArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.constant(true), weight: 4 },
    { arbitrary: fc.constant(false), weight: 1 },
  )

export const timeEntryCustomerArbitrary = (fc: typeof FastCheck) =>
  fc.oneof(
    { arbitrary: fc.constant(null), weight: 1 },
    { arbitrary: fc.constantFrom(...customerPool), weight: 3 },
  )

export const timeEntryServiceArbitrary = (fc: typeof FastCheck) =>
  fc.constantFrom(...timeEntryServices)

export const timeEntryDescriptionArbitrary = nullableConstantFrom(
  timeEntryDescriptions,
  { nullWeight: 1, valueWeight: 3 },
)
