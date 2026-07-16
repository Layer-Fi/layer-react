import { Schema } from 'effect'

import { type TagDimension, TagDimensionSchema } from '@schemas/tag'

import { tagDimensionStore } from '@msw/api/businesses/[business-id]/tags/dimensions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeTagDimensions = Schema.encodeSync(Schema.Array(TagDimensionSchema))

const toResponse = (dimensions: readonly TagDimension[]) =>
  apiData({ dimensions: encodeTagDimensions(dimensions) })

export const get = createMockEndpoint<readonly TagDimension[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/tags/dimensions',
  resolve: ({ override: dimensions = tagDimensionStore.all() }) => toResponse(dimensions),
})
