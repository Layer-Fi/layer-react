import useSWR from 'swr'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { getCategories } from '../../api/layer/categories'

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
  mode?: 'ALL'
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
  mode?: 'ALL'
}

export function useCategories({ mode }: UseCategoriesOptions = {}) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildKey({
      ...auth,
      businessId,
      mode,
    }),
    ({ accessToken, apiUrl, businessId, mode }) => getCategories(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          mode,
        },
      })().then(({ data }) => data.categories),
  )
}
