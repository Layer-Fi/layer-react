import useSWRMutation from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import { type APIError } from '@utils/api/apiError'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { createBuildKey } from '@utils/swr/createBuildKey'
import type { UseBankTransactionsOptions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

type GetBankTransactionsExportParams = {
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

const getBankTransactionsExcel = get<
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
      (
        {
          accessToken,
          apiUrl,
          businessId,
        },
        {
          arg: {
            categorized,
            direction,
            query,
            startDate,
            endDate,
            tagFilterQueryString,
          },
        }: { arg: UseBankTransactionsDownloadOptions },
      ) =>
        getBankTransactionsExcel(
          apiUrl,
          accessToken,
          {
            params: {
              businessId,
              categorized,
              query,
              direction,
              startDate,
              endDate,
              tagFilterQueryString,
            },
          },
        )().then(({ data }) => data),
      {
        revalidate: false,
        throwOnError: false,
      },
      )
}
