import { Schema } from 'effect'

import { CatalogServiceSchema } from '@schemas/catalogService'

import { serviceNames } from '@fixtures/constants/timeTracking/serviceNames'
import { centsAmountArbitrary } from '@fixtures/utils/amountArbitrary'
import { dateArbitrary } from '@fixtures/utils/dateArbitrary'
import { withArbitrary } from '@fixtures/utils/withArbitrary'

const fields = CatalogServiceSchema.fields

const base = Schema.Struct({
  ...fields,
  name: withArbitrary(fields.name, () => fc => fc.constantFrom(...serviceNames)),
  billableRatePerHourAmount: withArbitrary(fields.billableRatePerHourAmount, () =>
    centsAmountArbitrary({ minDollars: 25, maxDollars: 300, stepDollars: 5 })),
  archivedAt: withArbitrary(fields.archivedAt, () => fc =>
    fc.oneof(
      { arbitrary: fc.constant(null), weight: 5 },
      { arbitrary: dateArbitrary(fc), weight: 1 },
    )),
})

export const schema = base
