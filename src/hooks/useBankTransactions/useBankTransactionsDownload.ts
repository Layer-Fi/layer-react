import useSWRMutation from 'swr/mutation'

import type { S3PresignedUrl } from '@internal-types/general'
import { type APIError } from '@models/APIError'
import { getBankTransactionsExcel } from '@api/layer/bankTransactions'
import { useAuth } from '@hooks/useAuth'
import type { UseBankTransactionsOptions } from '@hooks/useBankTransactions/useBankTransactions'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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
