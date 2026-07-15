import { Schema } from 'effect'

import { type TagDimension, TagDimensionSchema, TagDimensionStrictnessSchema } from '@schemas/tag'

import { tagDimensionStore } from '@msw/api/businesses/[business-id]/tags/dimensions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const CreateTagDimensionBodySchema = Schema.Struct({
  key: Schema.NonEmptyTrimmedString,
  strictness: TagDimensionStrictnessSchema,
  displayName: Schema.optional(Schema.NonEmptyTrimmedString),
  definedValues: Schema.propertySignature(Schema.Array(Schema.NonEmptyTrimmedString))
    .pipe(Schema.fromKey('defined_values')),
})

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

    const now = new Date()
    const dimension: TagDimension = {
      id: crypto.randomUUID(),
      key,
      displayName: displayName ?? null,
      strictness,
      definedValues: definedValues.map(value => ({
        id: crypto.randomUUID(),
        key,
        value,
        displayName: null,
        archivedAt: null,
      })),
      createdAt: now,
      updatedAt: now,
      userVisible: true,
    }
    tagDimensionStore.save(dimension)

    return toResponse(dimension)
  },
})
