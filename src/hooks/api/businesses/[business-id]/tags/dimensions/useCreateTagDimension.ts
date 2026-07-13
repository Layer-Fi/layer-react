import { Schema } from 'effect'

import { type TagDimensionSchema, TagDimensionStrictnessSchema } from '@schemas/tag'
import { post } from '@utils/api/authenticatedHttp'
import { useTagDimensionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/tags/dimensions/useTagDimensions'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const CREATE_TAG_DIMENSION_TAG_KEY = '#create-tag-dimension'

const CreateTagDimensionBodySchema = Schema.Struct({
  key: Schema.NonEmptyTrimmedString,
  strictness: TagDimensionStrictnessSchema,
  displayName: Schema.optional(Schema.NonEmptyTrimmedString),
  definedValues: Schema.propertySignature(Schema.Array(Schema.NonEmptyTrimmedString))
    .pipe(Schema.fromKey('defined_values')),
})

const createTagDimension = post<
  { data: typeof TagDimensionSchema.Encoded },
  typeof CreateTagDimensionBodySchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tags/dimensions`)

export const useCreateTagDimension = createMutationHook({
  tags: [CREATE_TAG_DIMENSION_TAG_KEY],
  request: createTagDimension,
  argToBody: (tagDimension: typeof CreateTagDimensionBodySchema.Type) =>
    Schema.encodeSync(CreateTagDimensionBodySchema)(tagDimension),
  useOnTriggerSuccess: () => {
    const { invalidate: invalidateTagDimensions } = useTagDimensionsGlobalCacheActions()
    return async () => {
      await invalidateTagDimensions()
    }
  },
})
