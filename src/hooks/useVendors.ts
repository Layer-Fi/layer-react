import useSWR from 'swr'

import { type Vendor } from '@internal-types/vendors'
import { get } from '@utils/api/authenticatedHttp'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const getVendors = get<{ data: Vendor[] }>(
  ({ businessId }) => `/v1/businesses/${businessId}/vendors`,
)

type UseVendors = () => {
  data: Vendor[]
}

export const useVendors: UseVendors = () => {
  const { businessId } = useLayerContext()
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()

  const queryKey =
    businessId
    && auth?.access_token
    && `vendors-${businessId}`

  const { data } = useSWR(
    queryKey,
    getVendors(apiUrl, auth?.access_token, {
      params: {
        businessId,
      },
    }),
  )

  return {
    data: data?.data ?? [],
  }
}
