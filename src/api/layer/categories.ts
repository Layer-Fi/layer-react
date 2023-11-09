import { get } from './authenticated_http'

export const getCategories = get(
  ({ businessId }) =>
    `https://sandbox.layerfi.com/v1/businesses/${businessId}/categories`,
)
