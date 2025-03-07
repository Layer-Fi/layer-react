import { RawNotificationsData } from '../../hooks/notifications/types'
import { get } from './authenticated_http'

export const getNotifications = get<{ data: RawNotificationsData }>(
  ({ businessId }) => `/v1/businesses/${businessId}/notifications`,
)
