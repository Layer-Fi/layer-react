import { type TagValueDefinitionSchema } from '@schemas/features/tags/tagValueDefinition'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useTagDimensionsGlobalCacheActions } from '@api/businesses/[business-id]/tags/dimensions/get'

const CREATE_TAG_VALUE_DEFINITION_TAG_KEY = '#create-tag-value-definition'

const createTagValueDefinition = post<
  { data: typeof TagValueDefinitionSchema.Encoded },
  { value: string, displayName?: string },
  {
    businessId: string
    dimensionId: string
  }
>(({ businessId, dimensionId }) => `/v1/businesses/${businessId}/tags/dimensions/${dimensionId}/values`)

type CreateTagValueDefinitionArg = {
  dimensionId: string
  value: string
  displayName?: string
}

export const usePostTagValueDefinition = createMutationHook({
  tags: [CREATE_TAG_VALUE_DEFINITION_TAG_KEY],
  request: createTagValueDefinition,
  argToParams: ({ dimensionId }: CreateTagValueDefinitionArg) => ({ dimensionId }),
  argToBody: ({ value, displayName }: CreateTagValueDefinitionArg) => ({ value, displayName }),
  useOnTriggerSuccess: () => {
    const { invalidate: invalidateTagDimensions } = useTagDimensionsGlobalCacheActions()
    return async () => {
      await invalidateTagDimensions()
    }
  },
})
