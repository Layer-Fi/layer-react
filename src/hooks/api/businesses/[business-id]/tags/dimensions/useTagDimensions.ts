import { Schema } from 'effect'
import useSWR from 'swr'

import { type TagDimension, TagDimensionSchema } from '@schemas/tag'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createResourceGlobalCacheActions } from '@utils/swr/createGlobalCacheActions'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const TAG_DIMENSIONS_TAG_KEY = '#tag-dimensions'

const buildKey = createBuildKey<{ businessId: string }>([TAG_DIMENSIONS_TAG_KEY])

const getTagDimensions = get<
  { data: unknown },
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tags/dimensions`)

const TagDimensionsListSchema = Schema.Array(TagDimensionSchema)

type UseTagDimensionsParameters = {
  isEnabled?: boolean
}

export function useTagDimensions({ isEnabled = true }: UseTagDimensionsParameters = {}) {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { businessId } = useLayerContext()

  const swrResponse = useSWR(
    () => withLocale(buildKey({ ...auth, apiUrl, businessId, isEnabled })),
    ({ accessToken, apiUrl, businessId }) => getTagDimensions(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
        },
      },
    )()
      .then(({ data }) => data)
      .then(Schema.decodeUnknownPromise(
        Schema.Struct({
          dimensions: TagDimensionsListSchema,
        }),
      ))
      .then(({ dimensions }) => dimensions),
  )

  return new SWRQueryResult(swrResponse)
}

export const useTagDimensionsGlobalCacheActions = createResourceGlobalCacheActions<ReadonlyArray<TagDimension>>(TAG_DIMENSIONS_TAG_KEY)

export function usePreloadTagDimensions(parameters?: UseTagDimensionsParameters) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useTagDimensions(parameters)
}
