import { useCallback } from 'react'

import { type TagValueDefinitionSchema } from '@schemas/tag'
import { post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useTagDimensionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/tags/dimensions/useTagDimensions'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

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

const useCreateTagValueDefinitionMutation = createMutationHook({
  tags: [CREATE_TAG_VALUE_DEFINITION_TAG_KEY],
  request: createTagValueDefinition,
  argToParams: ({ dimensionId }: CreateTagValueDefinitionArg) => ({ dimensionId }),
  argToBody: ({ value, displayName }: CreateTagValueDefinitionArg) => ({ value, displayName }),
})

export function useCreateTagDimension() {
  const mutationResponse = useCreateTagValueDefinitionMutation()

  const { invalidate: invalidateTagDimensions } = useTagDimensionsGlobalCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      await invalidateTagDimensions()

      return triggerResult
    },
    [
      invalidateTagDimensions,
      originalTrigger,
    ],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
