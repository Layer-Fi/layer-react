import useSWRMutation from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import { type APIError } from '@utils/api/apiError'
import { get } from '@utils/api/authenticatedHttp'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import type { UseBankTransactionsOptions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
},
) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: ['#bank-transactions-download-excel'],
    } as const
  }
}

type UseBankTransactionsDownloadOptions = UseBankTransactionsOptions

export function useBankTransactionsDownload() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  return useSWRMutation<
    S3PresignedUrl,
    APIError,
    () => ReturnType<typeof buildKey>,
    UseBankTransactionsDownloadOptions>(
      () => buildKey({
        ...data,
        businessId,
      }),
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
