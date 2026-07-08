import { createGenerator } from '@fixtures/utils/createGenerator'
import { schema } from '@fixtures/vendors/schema'

export const generator = createGenerator(schema, {
  uniqueBy: [
    vendor => vendor.id,
    vendor => vendor.individualName ?? vendor.companyName,
    vendor => vendor.externalId,
  ],
  seed: 2,
})
