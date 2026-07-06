import { schema } from '@fixtures/vendors/schema'
import { createGenerator } from '@fixtures/utils/createGenerator'

export const generator = createGenerator(schema, {
  uniqueBy: vendor => vendor.individualName ?? vendor.companyName,
})
