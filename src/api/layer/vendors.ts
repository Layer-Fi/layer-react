import { Vendor } from '@internal-types/vendors'
import { get } from '@api/layer/authenticated_http'

export const getVendors = get<{ data: Vendor[] }>(
  ({ businessId }) => `/v1/businesses/${businessId}/vendors`,
)
