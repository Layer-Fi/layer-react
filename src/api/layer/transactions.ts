import { get } from './authenticated_http'

export const getTransactions = get(
  ({ businessId }) =>
    `https://sandbox.layerfi.com/v1/businesses/${businessId}/bank-transactions`,
)
