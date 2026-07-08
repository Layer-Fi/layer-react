import { schema } from '@fixtures/customAccounts/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'

export const generator = createGenerator(schema, {
  uniqueBy: [account => account.id, account => account.externalId],
})
