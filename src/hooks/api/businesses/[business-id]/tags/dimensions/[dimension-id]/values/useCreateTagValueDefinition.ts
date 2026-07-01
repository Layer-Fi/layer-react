import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { type TagValueDefinitionSchema } from '@schemas/tag'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useTagDimensionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/tags/dimensions/useTagDimensions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const CREATE_TAG_VALUE_DEFINITION_TAG_KEY = '#create-tag-value-definition'

const buildKey = createBuildKey<{ businessId: string }>([CREATE_TAG_VALUE_DEFINITION_TAG_KEY])

const createTagValueDefinition = post<
  { data: typeof TagValueDefinitionSchema.Encoded },
  { value: string, displayName?: string },
  {
    businessId: string
    dimensionId: string
  }
>(({ businessId, dimensionId }) => `/v1/businesses/${businessId}/tags/dimensions/${dimensionId}/values`)

export function useCreateTagDimension() {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { businessId } = useLayerContext()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      apiUrl,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: { dimensionId, value, displayName } }: { arg: { dimensionId: string, value: string, displayName?: string } },
    ) => createTagValueDefinition(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          dimensionId,
        },
        body: { value, displayName },
      },
    ),
  )

  const { invalidate: invalidateTagDimensions } = useTagDimensionsGlobalCacheActions()

  const { trigger: originalTrigger } = mutationResponse

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
