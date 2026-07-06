import { schema } from '@fixtures/customers/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'

export const generator = createGenerator(schema, {
  uniqueBy: customer => customer.individualName ?? customer.companyName,
})
