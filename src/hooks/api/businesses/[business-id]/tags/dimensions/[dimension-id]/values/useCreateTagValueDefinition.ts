import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { type TagValueDefinitionSchema } from '@schemas/tag'
import { post } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { useGlobalCacheActions } from '@utils/swr/useGlobalCacheActions'
import { TAG_DIMENSIONS_TAG_KEY } from '@hooks/api/businesses/[business-id]/tags/dimensions/useTagDimensions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const CREATE_TAG_VALUE_DEFINITION_TAG_KEY = '#create-tag-value-definition'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [CREATE_TAG_VALUE_DEFINITION_TAG_KEY],
    } as const
  }
}

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

  const { invalidate } = useGlobalCacheActions()

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      await invalidate(({ tags }) => tags.includes(TAG_DIMENSIONS_TAG_KEY))

      return triggerResult
    },
    [
      invalidate,
      originalTrigger,
    ],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
