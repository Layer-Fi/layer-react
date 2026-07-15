import { Schema } from 'effect'

import { type TagValueDefinition, TagValueDefinitionSchema } from '@schemas/tag'

import { tagDimensionStore } from '@msw/api/businesses/[business-id]/tags/dimensions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

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

    // Seed a fallback for unknown ids so the created value is always readable back.
    // The schema requires a UUID id, so the fallback gets a fresh one and keeps
    // the requested id as its key.
    const dimension = tagDimensionStore.findById(dimensionId) ?? {
      id: crypto.randomUUID(),
      key: dimensionId,
      displayName: null,
      strictness: 'BALANCING' as const,
      definedValues: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      userVisible: true,
    }

    const valueDefinition: TagValueDefinition = {
      id: crypto.randomUUID(),
      key: dimension.key,
      value,
      displayName: displayName ?? null,
      archivedAt: null,
    }

    tagDimensionStore.save({
      ...dimension,
      definedValues: [...dimension.definedValues, valueDefinition],
      updatedAt: new Date(),
    })

    return toResponse(valueDefinition)
  },
})
