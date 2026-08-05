import { Schema } from 'effect'

import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { type TagDimension, TagDimensionSchema } from '@schemas/features/tags/tagDimension'
import { get } from '@utils/shared/api/authenticatedHttp'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'
import { createResourceGlobalCacheActions } from '@hooks/utils/swr/createResourceGlobalCacheActions'

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

export const useGetTagDimensions = createQueryHook({
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
  useGetTagDimensions(parameters)
}
