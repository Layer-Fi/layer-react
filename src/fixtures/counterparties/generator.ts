import { schema } from '@fixtures/counterparties/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'

export const generator = createGenerator(schema, {
  uniqueBy: [
    counterparty => counterparty.id,
    counterparty => counterparty.name,
  ],
})
