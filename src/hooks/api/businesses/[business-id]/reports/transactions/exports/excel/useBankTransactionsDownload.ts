import type { S3PresignedUrl } from '@internal-types/general'
import { getAsMutation } from '@utils/api/getAsMutation'
import { getWithQuery } from '@utils/api/getWithQuery'
import type { UseBankTransactionsOptions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

type GetBankTransactionsExportParams = {
  businessId: string
  categorized?: boolean
  direction?: 'INFLOW' | 'OUTFLOW'
  query?: string
  startDate?: Date
  endDate?: Date
  tagKey?: string
  tagValues?: string
  sortOrder?: 'ASC' | 'DESC'
  sortBy?: string
}

const getBankTransactionsExcel = getWithQuery<
  { data: S3PresignedUrl },
  GetBankTransactionsExportParams
>(
  ['businessId'],
  ({ businessId }) => `/v1/businesses/${businessId}/reports/transactions/exports/excel`,
  ({ categorized, direction, query, startDate, endDate, sortBy = 'date', sortOrder = 'DESC' }) => ({
    categorized,
    direction,
    q: query,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  }),
)

const requestBankTransactionsExcel = getAsMutation(getBankTransactionsExcel)

type UseBankTransactionsDownloadOptions = UseBankTransactionsOptions

export const useBankTransactionsDownload = createMutationHook({
  tags: ['#bank-transactions-download-excel'],
  request: requestBankTransactionsExcel,
  argToParams: (arg: UseBankTransactionsDownloadOptions) => arg,
  argToBody: () => undefined,
  select: ({ data }: { data: S3PresignedUrl }) => data,
  swrOptions: { throwOnError: false },
})
