import useSWR, { SWRResponse } from 'swr'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import {
  getCategoriesNew,
} from '../../api/layer/categories'
import { CategoriesListModeEnum, CategoryListSchema } from '../../schemas/categorization'
import { Schema } from 'effect'

export const CATEGORIES_TAG_KEY = '#categories'

const GetCategoriesRawResultSchema = Schema.Struct({
  data: CategoryListSchema,
})

type GetCategoriesRawResult = typeof GetCategoriesRawResultSchema.Type

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

class GetCategoriesSWRResponse {
  private swrResponse: SWRResponse<GetCategoriesRawResult>

  constructor(swrResponse: SWRResponse<GetCategoriesRawResult>) {
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

export function useCategoriesNew({ mode }: UseCategoriesOptions = {}) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildKey({
      ...auth,
      businessId,
      mode,
    }),
    ({ accessToken, apiUrl, businessId, mode }) => getCategoriesNew(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          mode,
        },
      })().then(Schema.decodeUnknownPromise(GetCategoriesRawResultSchema)).then(response => response?.data?.categories),
  )
}
