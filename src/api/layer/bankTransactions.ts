import { CategoryUpdate, BankTransaction, Metadata } from '../../types'
import { get, put } from './authenticated_http'

export type GetBankTransactionsReturn = {
  data?: BankTransaction[]
  meta?: Metadata
  error?: unknown
}
export interface GetBankTransactionsParams
  extends Record<string, string | undefined> {
  businessId: string
  sortOrder?: 'ASC' | 'DESC'
  sortBy?: string
}
export const getBankTransactions = get<
  GetBankTransactionsReturn,
  GetBankTransactionsParams
>(
  ({
    businessId,
    sortBy = 'date',
    sortOrder = 'DESC',
  }: GetBankTransactionsParams) =>
    // `/v1/businesses/${businessId}/bank-transactions?sort_by=${sortBy}&sort_order=${sortOrder}`,
    `/v1/businesses/73f3058d-2071-4f94-998c-7bb2b635ff20/bank-transactions?sort_by=${sortBy}&sort_order=${sortOrder}`,
)

export const categorizeBankTransaction = put<
  { data: BankTransaction; errors: unknown },
  CategoryUpdate
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/categorize`,
)
