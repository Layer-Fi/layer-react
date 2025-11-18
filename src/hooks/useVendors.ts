import useSWR from 'swr'

import { type Vendor } from '@internal-types/vendors'
import { Layer } from '@api/layer'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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
    Layer.getVendors(apiUrl, auth?.access_token, {
      params: {
        businessId,
      },
    }),
  )

  return {
    data: data?.data ?? [],
  }
}
