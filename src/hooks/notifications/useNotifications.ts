import { useLayerContext } from '../../contexts/LayerContext'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { useAuth } from '../useAuth'
import useSWR from 'swr'
import { getNotifications } from '../../api/layer/notifications'

export const useNotifications = () => {
  const { businessId } = useLayerContext()
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()

  const queryKey =
    businessId
    && auth?.access_token
    && `notifications-${businessId}`

  return useSWR(
    queryKey,
    getNotifications(apiUrl, auth?.access_token, {
      params: {
        businessId,
      },
    }),
  )
}
