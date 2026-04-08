import { Schema } from 'effect'
import useSWR from 'swr'

import { type CategoriesListMode, CategoryListSchema, type NestedCategorization } from '@schemas/categorization'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export const CATEGORIES_TAG_KEY = '#categories'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  mode,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  mode?: CategoriesListMode
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      mode,
      tags: [CATEGORIES_TAG_KEY],
    } as const
  }
}

export const getCategories = get<
  {
    data: {
      type: 'Category_List'
      categories: NestedCategorization[]
    }
  },
  {
    businessId: string
    mode?: CategoriesListMode
  }
>(({ businessId, mode }) => {
  const parameters = toDefinedSearchParameters({ mode })

  return `/v1/businesses/${businessId}/categories?${parameters}`
})

type UseCategoriesOptions = {
  mode?: CategoriesListMode
}

export function useCategories({ mode }: UseCategoriesOptions = {}) {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      mode,
    })),
    ({ accessToken, apiUrl, businessId, mode }) => getCategories(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          mode,
        },
      })()
      .then(({ data }) => Schema.decodeUnknownPromise(CategoryListSchema)(data))
      .then(categoryList => categoryList.categories),
  )
}

export function usePreloadCategories(options?: UseCategoriesOptions) {
  /*
   * This will initiate a network request to fill the cache, but will not
   * cause a re-render when `data` changes.
   */
  useCategories(options)
}
