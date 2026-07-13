import { Schema } from 'effect'

import { CatalogServiceSchema } from '@schemas/catalogService'

import { billableRatePerHourArbitrary, serviceNameArbitrary } from '@fixtures/catalogServices/arbitrary'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'

const fields = CatalogServiceSchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.catalogService)),
  name: withArbitrary(fields.name, () => serviceNameArbitrary),
  billableRatePerHourAmount: withArbitrary(fields.billableRatePerHourAmount, () => billableRatePerHourArbitrary),
  archivedAt: withArbitrary(fields.archivedAt, () => fc => fc.constant(null)),
})

export const schema = base
