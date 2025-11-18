import useSWR, { type SWRResponse } from 'swr'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { get } from '@api/layer/authenticated_http'
import { Schema } from 'effect'
import { TagDimensionSchema } from '@features/tags/tagSchemas'

export const TAG_DIMENSIONS_TAG_KEY = '#tag-dimensions'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  isEnabled,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  isEnabled: boolean
}) {
  if (!isEnabled) {
    return
  }

  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [TAG_DIMENSIONS_TAG_KEY],
    } as const
  }
}

const getTagDimensions = get<
  { data: unknown },
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tags/dimensions`)

const TagDimensionsListSchema = Schema.Array(TagDimensionSchema)

class TagDimensionsSWRResponse {
  private swrResponse: SWRResponse<typeof TagDimensionsListSchema.Type>

  constructor(swrResponse: SWRResponse<typeof TagDimensionsListSchema.Type>) {
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

type UseTagDimensionsParameters = {
  isEnabled?: boolean
}

export function useTagDimensions({ isEnabled = true }: UseTagDimensionsParameters = {}) {
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()
  const { businessId } = useLayerContext()

  const swrResponse = useSWR(
    () => buildKey({
      ...auth,
      apiUrl,
      businessId,
      isEnabled,
    }),
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

  return new TagDimensionsSWRResponse(swrResponse)
}

export function usePreloadTagDimensions(parameters?: UseTagDimensionsParameters) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useTagDimensions(parameters)
}
