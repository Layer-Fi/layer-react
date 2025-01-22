import useSWR from 'swr'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { getCategories } from '../../api/layer/categories'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      mode: 'ALL',
      tags: ['#categories'],
    } as const
  }
}

export function useAllCategories() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildKey({
      ...auth,
      businessId,
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
