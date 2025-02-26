import { Vendor } from '../../types/vendors'
import { get } from './authenticated_http'

export const getVendors = get<{ data: Vendor[] }>(
  ({ businessId }) => `/v1/businesses/${businessId}/vendors`,
)
