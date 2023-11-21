import { CategoryUpdate, BankTransaction, Metadata } from '../../types'
import { get, put } from './authenticated_http'

export const getBankTransactions = get<{
  data?: BankTransaction[]
  meta?: Metadata
  error?: unknown
}>(
  ({ businessId }) =>
    `https://sandbox.layerfi.com/v1/businesses/${businessId}/bank-transactions`,
)

export const categorizeBankTransaction = put<
  CategoryUpdate,
  { data: BankTransaction; error: unknown }
>(
  ({ businessId, bankTransactionId }) =>
    `https://sandbox.layerfi.com/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/categorize`,
)
