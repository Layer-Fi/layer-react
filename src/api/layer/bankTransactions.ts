import { CategoryUpdate, BankTransaction, Metadata } from '../../types'
import {
  BankTransactionMatch,
  BankTransactionMatchType,
  BankTransactionMetadata,
  DocumentS3Urls,
  FileMetadata,
} from '../../types/bank_transactions'
import { S3PresignedUrl } from '../../types/general'
import { get, put, post, postWithFormData } from './authenticated_http'

export type GetBankTransactionsReturn = {
  data?: BankTransaction[]
  meta?: Metadata
  error?: unknown
}

export interface GetBankTransactionsParams
  extends Record<string, string | undefined> {
  businessId: string
  cursor?: string
  categorized?: string
  startDate?: string
  endDate?: string
  sortOrder?: 'ASC' | 'DESC'
  sortBy?: string
}
export const getBankTransactions = get<
  GetBankTransactionsReturn,
  GetBankTransactionsParams
>(
  ({
    businessId,
    cursor,
    categorized,
    startDate,
    endDate,
    sortBy = 'date',
    sortOrder = 'DESC',
  }: GetBankTransactionsParams) =>
    `/v1/businesses/${businessId}/bank-transactions?${
      cursor ? `cursor=${cursor}&` : ''
    }${
      categorized !== undefined && categorized !== ''
        ? `categorized=${categorized}&`
        : ''
    }${
      startDate !== undefined && startDate !== ''
        ? `start_date=${startDate}&`
        : ''
    }${
      endDate !== undefined && endDate !== ''
        ? `end_date=${endDate}&`
        : ''
    }sort_by=${sortBy}&sort_order=${sortOrder}&limit=200`,
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

export interface GetBankTransactionsCsvParams
  extends Record<string, string | undefined> {
  businessId: string
  startDate?: string
  endDate?: string
  categorized?: 'true' | 'false'
  category?: string
  month?: string
  year?: string
}

export const getBankTransactionsCsv = get<{
  data?: S3PresignedUrl
  error?: unknown
}>((params: Record<string, string | undefined>) => {
  const { businessId, startDate, endDate, categorized, category, month, year } =
    params as GetBankTransactionsCsvParams // Type assertion here for clarity
  return `/v1/businesses/${businessId}/reports/transactions/exports/csv?${
    startDate ? `start_date=${encodeURIComponent(startDate)}&` : ''
  }${endDate ? `end_date=${encodeURIComponent(endDate)}&` : ''}${
    month ? `month=${encodeURIComponent(month)}&` : ''
  }${year ? `year=${encodeURIComponent(year)}&` : ''}${
    categorized ? `categorized=${categorized}&` : ''
  }${category ? `category=${encodeURIComponent(category)}&` : ''}`
})

export const getBankTransactionMetadata = get<{
  data: BankTransactionMetadata
  errors: unknown
}>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/metadata`,
)

export const updateBankTransactionMetadata = put<
  { data: BankTransactionMetadata; errors: unknown },
  { memo: string }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/metadata`,
)

export const listBankTransactionDocuments = get<{
  data: DocumentS3Urls
  errors: unknown
}>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/documents`,
)

export const uploadBankTransactionDocument =
  (baseUrl: string, accessToken: string) =>
  ({
    businessId,
    bankTransactionId,
    file,
    documentType,
  }: {
    businessId: string
    bankTransactionId: string
    file: File
    documentType: string
  }) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentType', documentType)

    const endpoint = `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/documents`
    return postWithFormData<{ data: FileMetadata; errors: unknown }>(
      endpoint,
      formData,
      baseUrl,
      accessToken,
    )
  }
