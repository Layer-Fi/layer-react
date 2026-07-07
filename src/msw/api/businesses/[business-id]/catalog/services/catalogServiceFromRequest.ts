import { Schema } from 'effect'

import { type CatalogService, UpdateCatalogServiceSchema } from '@schemas/catalogService'

import { createRequestBodyEcho } from '@msw/utils/createRequestBodyEcho'

const decodeService = Schema.decodeUnknownSync(UpdateCatalogServiceSchema)

// Create and update share the same wire fields; the update schema (all
// optional) decodes both, and only the fields the caller sent are echoed.
export const catalogServiceFromRequest = createRequestBodyEcho<CatalogService>((input) => {
  const body = decodeService(input)

  return {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.billableRatePerHourAmount !== undefined
      ? { billableRatePerHourAmount: body.billableRatePerHourAmount ?? null }
      : {}),
  }
})
