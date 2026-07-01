import { Schema } from 'effect'
import useSWR from 'swr'

import { TagDimensionSchema } from '@schemas/tag'
import { get } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRQueryResult } from '@utils/swr/SWRResponseTypes'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

export const TAG_DIMENSION_BY_KEY_TAG_KEY = '#tag-dimension-by-key'

const buildKey = createBuildKey<{ businessId: string, dimensionKey: string }>([TAG_DIMENSION_BY_KEY_TAG_KEY])

const getTagDimensionByKey = get<
  { data: unknown },
  { businessId: string, dimensionKey: string }
>(({ businessId, dimensionKey }) => `/v1/businesses/${businessId}/tags/dimensions/key/${dimensionKey}`)

type UseTagDimensionByKeyParameters = {
  isEnabled?: boolean
  dimensionKey: string
}

export function useTagDimensionByKey({ isEnabled = true, dimensionKey }: UseTagDimensionByKeyParameters) {
  const { withLocale, businessId, apiUrl, auth } = useBuildKeyInputs()

  const swrResponse = useSWR(
    () => withLocale(buildKey({
      ...auth,
      apiUrl,
      isEnabled,
      businessId,
      dimensionKey,
    })),
    ({ accessToken, apiUrl, businessId }) => getTagDimensionByKey(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          dimensionKey,
        },
      },
    )()
      .then(({ data }) => Schema.decodeUnknownPromise(TagDimensionSchema)(data)),
  )

  return new SWRQueryResult(swrResponse)
}

export function usePreloadTagDimensionByKey(parameters: UseTagDimensionByKeyParameters) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useTagDimensionByKey(parameters)
}
