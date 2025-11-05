import useSWR, { type SWRResponse } from 'swr'
import { useAuth } from '../../../hooks/useAuth'
import { useEnvironment } from '../../../providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '../../../contexts/LayerContext/LayerContext'
import { get } from '../../../api/layer/authenticated_http'
import { Schema } from 'effect'
import { TagDimensionSchema, type TagDimension } from '../tagSchemas'

export const TAG_DIMENSION_BY_KEY_TAG_KEY = '#tag-dimension-by-key'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  isEnabled,
  dimensionKey,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  isEnabled: boolean
  dimensionKey: string
}) {
  if (!isEnabled) {
    return
  }

  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      dimensionKey,
      tags: [TAG_DIMENSION_BY_KEY_TAG_KEY],
    } as const
  }
}

const getTagDimensionByKey = get<
  { data: unknown },
  { businessId: string, dimensionKey: string }
>(({ businessId, dimensionKey }) => `/v1/businesses/${businessId}/tags/dimensions/key/${dimensionKey}`)

class TagDimensionByKeySWRResponse {
  private swrResponse: SWRResponse<TagDimension>

  constructor(swrResponse: SWRResponse<TagDimension>) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get isLoading() {
    return this.swrResponse.isLoading
  }

  get isValidating() {
    return this.swrResponse.isValidating
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

type UseTagDimensionByKeyParameters = {
  isEnabled?: boolean
  dimensionKey: string
}

export function useTagDimensionByKey({ isEnabled = true, dimensionKey }: UseTagDimensionByKeyParameters) {
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { businessId } = useLayerContext()

  const swrResponse = useSWR(
    () => buildKey({
      ...auth,
      apiUrl,
      isEnabled,
      businessId,
      dimensionKey,
    }),
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

  return new TagDimensionByKeySWRResponse(swrResponse)
}

export function usePreloadTagDimensionByKey(parameters: UseTagDimensionByKeyParameters) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useTagDimensionByKey(parameters)
}
