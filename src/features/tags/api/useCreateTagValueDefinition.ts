import useSWRMutation from 'swr/mutation'
import { post } from '../../../api/layer/authenticated_http'
import { type TagValueDefinitionSchema } from '../../../schemas/tag'
import { useAuth } from '../../../hooks/useAuth'
import { useEnvironment } from '../../../providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '../../../contexts/LayerContext'
import { useCallback } from 'react'
import { withSWRKeyTags } from '../../../utils/swr/withSWRKeyTags'
import { useGlobalCacheActions } from '../../../utils/swr/useGlobalCacheActions'
import { TAG_DIMENSIONS_TAG_KEY } from './useTagDimensions'

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
  { label: string },
  {
    businessId: string
    dimensionId: string
  }
>(({ businessId, dimensionId }) => `/v1/businesses/${businessId}/tags/dimensions/${dimensionId}/values`)

export function useCreateTagDimension() {
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { businessId } = useLayerContext()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      ...auth,
      apiUrl,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: { dimensionId, label } }: { arg: { dimensionId: string, label: string } },
    ) => createTagValueDefinition(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          dimensionId,
        },
        body: { label },
      },
    ),
  )

  const { invalidate } = useGlobalCacheActions()

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      await invalidate(key => withSWRKeyTags(
        key,
        tags => tags.includes(TAG_DIMENSIONS_TAG_KEY),
      ))

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
