import useSWRMutation from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import { type APIError } from '@utils/api/apiError'
import { getWithQuery } from '@utils/api/getWithQuery'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { createKeyedFetcher } from '@utils/swr/createKeyedFetcher'
import type { UseBankTransactionsOptions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

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

const fetchBankTransactionsExcel = createKeyedFetcher(getBankTransactionsExcel)

const buildKey = createBuildKey<{ businessId: string }>(['#bank-transactions-download-excel'])

type UseBankTransactionsDownloadOptions = UseBankTransactionsOptions

export function useBankTransactionsDownload() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  return useSWRMutation<
    S3PresignedUrl,
    APIError,
    () => ReturnType<typeof buildKey>,
    UseBankTransactionsDownloadOptions>(
      () => withLocale(buildKey({
        ...auth,
        businessId,
      })),
      (key, { arg }: { arg: UseBankTransactionsDownloadOptions }) =>
        fetchBankTransactionsExcel({ ...key, ...arg }).then(({ data }) => data),
      {
        revalidate: false,
        throwOnError: false,
      },
      )
}
