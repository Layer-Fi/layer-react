/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import useSWR from 'swr'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { get } from '../../api/layer/authenticated_http'
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'
import { CategoriesListModeEnum, CategoryList, CategoryListSchema } from '../../schemas/categorization'
import { Schema } from 'effect'

export const getCategoriesNew = get<
  { data: CategoryList },
  {
    businessId: string
    mode?: CategoriesListModeEnum
  }
>(({ businessId, mode }) => {
  const parameters = toDefinedSearchParameters({ mode })

  return `/v1/businesses/${businessId}/categories?${parameters}`
})

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
  mode?: CategoriesListModeEnum
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

type UseCategoriesOptions = {
  mode?: CategoriesListModeEnum
}

export function useCategoriesNew(
  { mode }: UseCategoriesOptions = {},
) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  return useSWR(
    () => buildKey({
      access_token: data?.access_token,
      apiUrl: data?.apiUrl,
      businessId,
      mode,
    }),
    ({ accessToken, apiUrl, businessId, mode }) => getCategoriesNew(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      apiUrl,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      accessToken,
      {
        params: { businessId, mode },
      },
    )().then(({ data }) => Schema.decodeUnknownPromise(CategoryListSchema)(data)),
  )
}
