import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { type TagDimensionSchema, TagDimensionStrictnessSchema } from '@schemas/tag'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useTagDimensionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/tags/dimensions/useTagDimensions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const CREATE_TAG_DIMENSION_TAG_KEY = '#create-tag-dimension'

const buildKey = createBuildKey<{ businessId: string }>([CREATE_TAG_DIMENSION_TAG_KEY])

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
