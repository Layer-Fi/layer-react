import useSWRMutation from 'swr/mutation'
import { post } from '../../../api/layer/authenticated_http'
import { TagDimensionSchema, TagDimensionStrictnessSchema } from '../tagSchemas'
import { useAuth } from '../../../hooks/useAuth'
import { useEnvironment } from '../../../providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '../../../contexts/LayerContext'
import { Schema } from 'effect'
import { useCallback } from 'react'
import { withSWRKeyTags } from '../../../utils/swr/withSWRKeyTags'
import { useGlobalCacheActions } from '../../../utils/swr/useGlobalCacheActions'
import { TAG_DIMENSIONS_TAG_KEY } from './useTagDimensions'

const CREATE_TAG_DIMENSION_TAG_KEY = '#create-tag-dimension'

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
      tags: [CREATE_TAG_DIMENSION_TAG_KEY],
    } as const
  }
}

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
      { arg: tagDimension }: { arg: typeof CreateTagDimensionBodySchema.Type },
    ) => createTagDimension(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
        },
        body: Schema.encodeSync(CreateTagDimensionBodySchema)(tagDimension),
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
