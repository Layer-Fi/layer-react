import { Schema } from 'effect'

import { type TagDimension, TagDimensionSchema } from '@schemas/tag'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { get } from '@utils/api/authenticatedHttp'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createGlobalCacheActions'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const TAG_DIMENSIONS_TAG_KEY = '#tag-dimensions'

const TagDimensionsListSchema = Schema.Array(TagDimensionSchema)

const TagDimensionsResponseSchema = UnwrappedDataResponseSchema(
  Schema.Struct({ dimensions: TagDimensionsListSchema }),
)

const getTagDimensions = get<
  typeof TagDimensionsResponseSchema.Encoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tags/dimensions`)

type UseTagDimensionsParameters = {
  isEnabled?: boolean
}

export const useTagDimensions = createQueryHook({
  tags: [TAG_DIMENSIONS_TAG_KEY],
  request: getTagDimensions,
  schema: TagDimensionsResponseSchema,
  select: data => data.dimensions,
})

export const useTagDimensionsGlobalCacheActions = createResourceGlobalCacheActions<ReadonlyArray<TagDimension>>(TAG_DIMENSIONS_TAG_KEY)

export function usePreloadTagDimensions(parameters?: UseTagDimensionsParameters) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useTagDimensions(parameters)
}
