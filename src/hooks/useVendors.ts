import { useLayerContext } from '../contexts/LayerContext/LayerContext'
import { useEnvironment } from '../providers/Environment/EnvironmentInputProvider'
import { useAuth } from './useAuth'
import { Layer } from '../api/layer'
import useSWR from 'swr'
import { Vendor } from '../types/vendors'

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
