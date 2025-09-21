import { CategoryUpdate, BankTransaction } from '../../types'
import {
  BankTransactionMatch,
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

type GetBankTransactionsBaseParams = {
  businessId: string
  categorized?: boolean
  direction?: 'INFLOW' | 'OUTFLOW'
  query?: string
  startDate?: Date
  endDate?: Date
  tagFilterQueryString?: string
  sortOrder?: 'ASC' | 'DESC'
  sortBy?: string
}
type GetBankTransactionsPaginatedParams = GetBankTransactionsBaseParams & {
  cursor?: string
  limit?: number
}

export const getBankTransactions = get<
  GetBankTransactionsReturn,
  GetBankTransactionsPaginatedParams
>(
  ({
    businessId,
    cursor,
    categorized,
    direction,
    limit,
    query,
    startDate,
    endDate,
    sortBy = 'date',
    sortOrder = 'DESC',
    tagFilterQueryString,
  }: GetBankTransactionsPaginatedParams) => {
    const parameters = toDefinedSearchParameters({
      cursor,
      categorized,
      direction,
      q: query,
      startDate,
      endDate,
      sortBy,
      sortOrder,
      limit,
    })

    return `/v1/businesses/${businessId}/bank-transactions?${parameters}${tagFilterQueryString ? `&${tagFilterQueryString}` : ''}`
  },
)

export const categorizeBankTransaction = put<
  { data: BankTransaction },
  CategoryUpdate,
  {
    businessId: string
    bankTransactionId: string
  }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/categorize`,
)

export type MatchBankTransactionBody = {
  match_id: string
  type: 'Confirm_Match'
}

export const matchBankTransaction = put<
  { data: BankTransactionMatch },
  MatchBankTransactionBody,
  {
    businessId: string
    bankTransactionId: string
  }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/match`,
)

type GetBankTransactionsExportParams = GetBankTransactionsBaseParams

export const getBankTransactionsExcel = get<
  { data: S3PresignedUrl },
  GetBankTransactionsExportParams
>(({
  businessId,
  categorized,
  direction,
  query,
  startDate,
  endDate,
  sortBy = 'date',
  sortOrder = 'DESC',
}: GetBankTransactionsExportParams) => {
  const parameters = toDefinedSearchParameters({
    categorized,
    direction,
    q: query,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  })

  return `/v1/businesses/${businessId}/reports/transactions/exports/excel?${parameters}`
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
