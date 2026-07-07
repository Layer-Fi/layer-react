import { Schema } from 'effect'

import { type CatalogService, UpdateCatalogServiceSchema } from '@schemas/catalogService'

import { createRequestBodyEcho } from '@msw/utils/createRequestBodyEcho'

const decodeService = Schema.decodeUnknownSync(UpdateCatalogServiceSchema)

export const catalogServiceFromRequest = createRequestBodyEcho<CatalogService>((input) => {
  const body = decodeService(input)

  return {
    ...(body.name !== undefined ? { name: body.name } : {}),
    ...(body.billableRatePerHourAmount !== undefined
      ? { billableRatePerHourAmount: body.billableRatePerHourAmount ?? null }
      : {}),
  }
})
