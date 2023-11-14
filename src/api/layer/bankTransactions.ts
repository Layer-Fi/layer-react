import { get, put } from './authenticated_http'

export const getBankTransactions = get(
  ({ businessId }) =>
    `https://sandbox.layerfi.com/v1/businesses/${businessId}/bank-transactions`,
)

export const categorizeBankTransaction = put(
  ({ businessId, bankTransactionId }) =>
    `https://sandbox.layerfi.com/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/categorize`,
)
