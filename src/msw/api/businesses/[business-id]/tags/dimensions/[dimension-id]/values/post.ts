import { Schema } from 'effect'

import { type TagValueDefinition, TagValueDefinitionSchema } from '@schemas/tag'

import { findOrSeedTagDimension, tagDimensionStore } from '@msw/api/businesses/[business-id]/tags/dimensions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'
import { makeTagValueDefinition } from '@fixtures/tagDimensions/mocks'

const CreateTagValueDefinitionBodySchema = Schema.Struct({
  value: Schema.NonEmptyTrimmedString,
  displayName: Schema.optional(Schema.NonEmptyTrimmedString),
})

const decodeCreateTagValueDefinitionBody = Schema.decodeUnknownSync(CreateTagValueDefinitionBodySchema)
const encodeTagValueDefinition = Schema.encodeSync(TagValueDefinitionSchema)

const toResponse = (valueDefinition: TagValueDefinition) => apiData(encodeTagValueDefinition(valueDefinition))

export const post = createMockEndpoint<TagValueDefinition, ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/tags/dimensions/:dimensionId/values',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const dimensionId = String(params.dimensionId)
    const { value, displayName } = decodeCreateTagValueDefinitionBody(await readRequestJson(request))

    const dimension = findOrSeedTagDimension(
      () => tagDimensionStore.findById(dimensionId),
      { id: dimensionId, key: dimensionId },
    )

    // Like the API's findOrCreateValueDefinition: an existing value (matched
    // case-insensitively) is returned instead of duplicated.
    const existingValue = dimension.definedValues.find(
      definedValue => definedValue.value.toLowerCase() === value.toLowerCase(),
    )
    if (existingValue) return toResponse(existingValue)

    const valueDefinition = makeTagValueDefinition({ key: dimension.key, value, displayName })

    tagDimensionStore.save({
      ...dimension,
      definedValues: [...dimension.definedValues, valueDefinition],
      updatedAt: new Date(),
    })

    return toResponse(valueDefinition)
  },
})
