import { Arbitrary, Schema } from 'effect'

import { BankTransactionCounterpartySchema } from '@schemas/bankTransactions/base'

import { mccArbitrary, merchantNameArbitrary } from '@fixtures/counterparties/arbitrary'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'

// The wire schema's fields are optional; fixture rows always fill them, so the
// fixture schema declares concrete counterparts.
const base = Schema.Struct({
  id: withArbitrary(BankTransactionCounterpartySchema.fields.id, () => idArbitrary(FixtureIdPrefix.counterparty)),
  externalId: Schema.String,
  name: withArbitrary(Schema.String, () => merchantNameArbitrary),
  website: Schema.String,
  logo: Schema.Null,
  mccs: withArbitrary(Schema.Array(Schema.String), () => fc => mccArbitrary(fc).map(mcc => [mcc])),
})

const baseArbitrary = Arbitrary.make(base)

const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '')

export const CounterpartyArbitrarySchema = base.annotations({
  arbitrary: () => () =>
    baseArbitrary.map((counterparty): typeof base.Type => {
      const slug = toSlug(counterparty.name)

      return {
        ...counterparty,
        externalId: `cp_${slug}`,
        website: `https://www.${slug}.com`,
        logo: null,
      }
    }),
})

export const schema = CounterpartyArbitrarySchema
