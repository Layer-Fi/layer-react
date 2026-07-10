import { TagDimensionSchema } from '@schemas/tag'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { get } from '@utils/api/authenticatedHttp'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const TAG_DIMENSION_BY_KEY_TAG_KEY = '#tag-dimension-by-key'

const TagDimensionByKeyResponseSchema = UnwrappedDataResponseSchema(TagDimensionSchema)

const getTagDimensionByKey = get<
  typeof TagDimensionByKeyResponseSchema.Encoded,
  { businessId: string, dimensionKey: string }
>(({ businessId, dimensionKey }) => `/v1/businesses/${businessId}/tags/dimensions/key/${dimensionKey}`)

type UseTagDimensionByKeyParameters = {
  isEnabled?: boolean
  dimensionKey: string
}

export const useTagDimensionByKey = createQueryHook({
  tags: [TAG_DIMENSION_BY_KEY_TAG_KEY],
  request: getTagDimensionByKey,
  schema: TagDimensionByKeyResponseSchema,
})

export function usePreloadTagDimensionByKey(parameters: UseTagDimensionByKeyParameters) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useTagDimensionByKey(parameters)
}
