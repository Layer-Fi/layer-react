import { Schema } from 'effect'

import { CreateTagDimensionBodySchema, type TagDimension, TagDimensionSchema } from '@schemas/tag'

import { findOrSeedTagDimension, tagDimensionStore } from '@msw/api/businesses/[business-id]/tags/dimensions/store'
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

    // Dimension keys are unique per business: like the API, creating an
    // existing key ensures the dimension and adds only its missing values.
    const ensured = findOrSeedTagDimension(
      dimensions => dimensions.find(dimension => dimension.key === key),
      { key, displayName, strictness },
    )

    const missingValues = definedValues.filter(value =>
      !ensured.definedValues.some(({ value: existingValue }) => existingValue.toLowerCase() === value.toLowerCase()),
    )

    const dimension: TagDimension = {
      ...ensured,
      definedValues: [
        ...ensured.definedValues,
        ...missingValues.map(value => makeTagValueDefinition({ key, value })),
      ],
      updatedAt: new Date(),
    }
    tagDimensionStore.save(dimension)

    return toResponse(dimension)
  },
})
