import { CategoryUpdate, BankTransaction, Metadata } from '../../types'
import {
  BankTransactionMatch,
  BankTransactionMatchType,
} from '../../types/bank_transactions'
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
    `/v1/businesses/${businessId}/bank-transactions?sort_by=${sortBy}&sort_order=${sortOrder}&limit=200`,
)

export const categorizeBankTransaction = put<
  { data: BankTransaction; errors: unknown },
  CategoryUpdate
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/categorize`,
)

export const matchBankTransaction = put<
  { data: BankTransactionMatch; errors: unknown },
  { match_id: string; type: BankTransactionMatchType }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/match`,
)
