import { CategoryUpdate, BankTransaction } from '../../types'
import {
  BankTransactionMatch,
  BankTransactionMatchType,
  BankTransactionMetadata,
  DocumentS3Urls,
} from '../../types/bank_transactions'
import { FileMetadata } from '../../types/file_upload'
import { S3PresignedUrl } from '../../types/general'
import { toDefinedSearchParameters } from '../../utils/request/toDefinedSearchParameters'
import { get, put, postWithFormData, post } from './authenticated_http'

export type GetBankTransactionsReturn = {
  data: ReadonlyArray<BankTransaction>
  meta: {
    pagination: {
      cursor?: string
      has_more: boolean
    }
  }
}

type GetBankTransactionsParams = {
  businessId: string
  cursor?: string
  categorized?: boolean
  direction?: 'INFLOW' | 'OUTFLOW'
  startDate?: Date
  endDate?: Date
  tagFilterQueryString?: string
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
    direction,
    startDate,
    endDate,
    sortBy = 'date',
    sortOrder = 'DESC',
    tagFilterQueryString,
  }: GetBankTransactionsParams) => {
    const parameters = toDefinedSearchParameters({
      cursor,
      categorized,
      direction,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      limit: 200,
    })

    return `/v1/businesses/${businessId}/bank-transactions?${parameters}${tagFilterQueryString ? `&${tagFilterQueryString}` : ''}`
  },
)

export const categorizeBankTransaction = put<
  { data: BankTransaction, errors: unknown },
  CategoryUpdate
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/categorize`,
)

export const matchBankTransaction = put<
  { data: BankTransactionMatch, errors: unknown },
  { match_id: string, type: BankTransactionMatchType }
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
  { data: BankTransactionMetadata, errors: unknown },
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
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/documents?content_disposition=ATTACHMENT`,
)

export const getBankTransactionDocument = get<{
  data: S3PresignedUrl
  errors: unknown
}>(
  ({ businessId, bankTransactionId, documentId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/documents/${documentId}?content_disposition=ATTACHMENT`,
)

export const archiveBankTransactionDocument = post<{
  data: Record<never, never>
  errors: unknown
}>(
  ({ businessId, bankTransactionId, documentId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/documents/${documentId}/archive`,
)

export const uploadBankTransactionDocument =
  (baseUrl: string, accessToken?: string) =>
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
      return postWithFormData<{ data: FileMetadata, errors: unknown }>(
        endpoint,
        formData,
        baseUrl,
        accessToken,
      )
    }
