import { Schema } from 'effect'

import { type CatalogService, CatalogServiceSchema } from '@schemas/timeTracking/catalogService'

import { createRequestBodyEcho } from '@msw/utils/createRequestBodyEcho'

export const catalogServiceFromRequest = createRequestBodyEcho<CatalogService>(
  Schema.decodeUnknownSync(Schema.partial(CatalogServiceSchema.pick('name', 'billableRatePerHourAmount'))),
)
