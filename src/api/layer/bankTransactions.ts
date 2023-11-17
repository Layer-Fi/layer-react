import { BankTransactions } from '../../components/BankTransactions'
import { CategoryUpdate, BankTransaction } from '../../types'
import { get, put } from './authenticated_http'

export const getBankTransactions = get<{
  data: BankTransaction[]
  meta: unknown
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
