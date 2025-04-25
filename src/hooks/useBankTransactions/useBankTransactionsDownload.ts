import useSWRMutation from 'swr/mutation'
import { useAuth } from '../useAuth'
import { useLayerContext } from '../../contexts/LayerContext'
import { getBankTransactionsExcel } from '../../api/layer/bankTransactions'
import type { UseBankTransactionsOptions } from './useBankTransactions'

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

  return useSWRMutation(
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
          descriptionFilter,
          startDate,
          endDate,
          tagFilterQueryString,
        },
      }: { arg: UseBankTransactionsDownloadOptions },
    ) => {
      return getBankTransactionsExcel(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
            categorized,
            descriptionFilter,
            direction,
            startDate,
            endDate,
            tagFilterQueryString,
          },
        },
      )().then(({ data }) => data)
    },
    {
      revalidate: false,
      throwOnError: false,
    },
  )
}
