import { Bill } from '../../types/bills'
import { get } from './authenticated_http'

export const getBills = get<{ data: Bill[] }>(
  ({ businessId }) => `/v1/businesses/${businessId}/bills`,
)
