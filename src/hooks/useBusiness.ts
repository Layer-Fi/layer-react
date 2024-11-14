import { getBusiness } from '../api/layer/business'
import { useBusinessId } from '../providers/business/BusinessInputProvider'
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
      tags: [ '#business', `#businessId:${businessId}` ]
    }
  }
}

export function useBusiness() {
  const { data: auth } = useAuth()
  const { businessId } = useBusinessId()

  return useSWR(
    buildKey({
      ...auth,
      businessId,
    }),
    ({ accessToken, apiUrl, businessId }) => getBusiness(
      apiUrl,
      accessToken,
      {
        params: {
          businessId
        }
      })().then(({ data }) => data),
  )
}