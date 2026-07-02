import { Schema } from 'effect'

import { type CategoriesListMode, CategoryListSchema } from '@schemas/categorization'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createQueryHook } from '@hooks/utils/swr/createQueryHook'

export const CATEGORIES_TAG_KEY = '#categories'

const CategoriesResponseSchema = Schema.Struct({
  data: CategoryListSchema,
})

type GetCategoriesParams = {
  businessId: string
  mode?: CategoriesListMode
}

export const getCategories = getWithQuery<
  typeof CategoriesResponseSchema.Encoded,
  GetCategoriesParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/categories`,
)

type UseCategoriesOptions = {
  mode?: CategoriesListMode
}

export const useCategories = createQueryHook({
  tags: [CATEGORIES_TAG_KEY],
  request: getCategories,
  schema: CategoriesResponseSchema,
  select: ({ data }) => data.categories,
})

export function usePreloadCategories(options?: UseCategoriesOptions) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useCategories(options)
}
