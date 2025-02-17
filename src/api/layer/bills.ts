import { Bill } from '../../types/bills'
import { get } from './authenticated_http'

export const getBills = get<{ data: Bill[] }>(
  ({ businessId, startDate, endDate, status }) => `/v1/businesses/${businessId}/bills?received_at_start=${startDate}&received_at_end=${endDate}&status=${status}`,
  // ({ businessId, startDate, endDate }) => `/v1/businesses/${businessId}/bills?status=PAID`,
)
