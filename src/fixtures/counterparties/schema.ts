import { Arbitrary, Schema } from 'effect'

import { BankTransactionCounterpartySchema } from '@schemas/bankTransactions/base'

import { mccArbitrary, merchantNameArbitrary } from '@fixtures/counterparties/arbitrary'
import { FixtureIdPrefix, idArbitrary } from '@fixtures/utils/arbitrary/id'
import { withArbitrary } from '@fixtures/utils/arbitrary/withArbitrary'

const fields = BankTransactionCounterpartySchema.fields

const base = Schema.Struct({
  ...fields,
  id: withArbitrary(fields.id, () => idArbitrary(FixtureIdPrefix.counterparty)),
  // The wire field is optional; the fixture requires a name so external id and
  // website can be derived from it.
  name: withArbitrary(Schema.String, () => merchantNameArbitrary),
  mccs: withArbitrary(fields.mccs, () => fc => mccArbitrary(fc).map(mcc => [mcc])),
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
