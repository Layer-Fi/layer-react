import { Schema } from 'effect'

import { CreateTagDimensionBodySchema } from '@schemas/features/tags/createTagDimensionBody'
import { type TagDimensionSchema } from '@schemas/features/tags/tagDimension'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useTagDimensionsGlobalCacheActions } from '@api/businesses/[business-id]/tags/dimensions/get'

const CREATE_TAG_DIMENSION_TAG_KEY = '#create-tag-dimension'

const createTagDimension = post<
  { data: typeof TagDimensionSchema.Encoded },
  typeof CreateTagDimensionBodySchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tags/dimensions`)

export const usePostTagDimension = createMutationHook({
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
