import { Schema } from 'effect'

import { UpsertVendorSchema, type Vendor } from '@schemas/vendor'

import { createRequestBodyEcho } from '@msw/utils/createRequestBodyEcho'

export const vendorFromUpsertRequest = createRequestBodyEcho<Vendor>(
  Schema.decodeUnknownSync(UpsertVendorSchema),
)
