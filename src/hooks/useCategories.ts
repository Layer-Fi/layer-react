import { getCategories } from '../api/layer/categories'
import { useBusinessId } from '../providers/BusinessProvider/BusinessInputProvider'
import { useAuth } from './useAuth'
import useSWR from 'swr'

function buildKey({
  accessToken,
  apiUrl,
  businessId
}: {
  accessToken?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [ '#categories', `#businessId:${businessId}` ]
    }
  }
}

export function useCategories() {
  const { data: auth } = useAuth()
  const { businessId } = useBusinessId()

  return useSWR(
    buildKey({
      ...auth,
      businessId,
    }),
    ({ accessToken, apiUrl, businessId }) => getCategories(
      apiUrl,
      accessToken,
      {
        params: {
          businessId
        }
      })().then(({ data: { categories } }) => categories),
  )
}