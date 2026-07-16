import { Schema } from 'effect'

import { type TagDimension, TagDimensionSchema } from '@schemas/tag'

import { findOrSeedTagDimension } from '@msw/api/businesses/[business-id]/tags/dimensions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeTagDimension = Schema.encodeSync(TagDimensionSchema)

const toResponse = (dimension: TagDimension) => apiData(encodeTagDimension(dimension))

export const get = createMockEndpoint<TagDimension, ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/tags/dimensions/key/:dimensionKey',
  resolve: ({ override, params }) => {
    if (override) return toResponse(override)

    const dimensionKey = String(params.dimensionKey)

    return toResponse(findOrSeedTagDimension(
      dimensions => dimensions.find(({ key }) => key === dimensionKey),
      { key: dimensionKey },
    ))
  },
})
