import { Schema } from 'effect'

import { CreateTagDimensionBodySchema, type TagDimension, TagDimensionSchema } from '@schemas/tag'

import { makeFallbackTagDimension, tagDimensionStore } from '@msw/api/businesses/[business-id]/tags/dimensions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'
import { makeTagValueDefinition } from '@fixtures/tagDimensions/mocks'

const decodeCreateTagDimensionBody = Schema.decodeUnknownSync(CreateTagDimensionBodySchema)
const encodeTagDimension = Schema.encodeSync(TagDimensionSchema)

const toResponse = (dimension: TagDimension) => apiData(encodeTagDimension(dimension))

export const post = createMockEndpoint<TagDimension, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/tags/dimensions',
  resolve: async ({ override, request }) => {
    if (override) return toResponse(override)

    const { key, strictness, displayName, definedValues } =
      decodeCreateTagDimensionBody(await readRequestJson(request))

    const dimension: TagDimension = {
      ...makeFallbackTagDimension({ key }),
      displayName: displayName ?? null,
      strictness,
      definedValues: definedValues.map(value => makeTagValueDefinition({ key, value })),
    }
    tagDimensionStore.save(dimension)

    return toResponse(dimension)
  },
})
