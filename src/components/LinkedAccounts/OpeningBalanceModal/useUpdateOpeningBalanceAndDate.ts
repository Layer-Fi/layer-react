import useSWRMutation from 'swr/mutation'
import { Layer } from '../../../api/layer'
import type { Awaitable } from '../../../types/utility/promises'
import { useAuth } from '../../../hooks/useAuth'
import { useLayerContext } from '../../../contexts/LayerContext'

type SetOpeningBalanceData = Record<string, { openingDate: Date, openingBalance: number }>

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  data,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  data: SetOpeningBalanceData
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      data,
      tags: ['#linked-accounts', '#opening-balance'],
    } as const
  }
}

function setOpeningBalanceOnAccount({
  apiUrl,
  accessToken,
  businessId,
  accountId,
  openingDate,
  openingBalance,
}: {
  apiUrl: string
  accessToken: string
  businessId: string
  accountId: string
  openingDate: Date
  openingBalance: number
}) {
  return Layer.updateOpeningBalance(
    apiUrl,
    accessToken,
    {
      params: {
        businessId,
        accountId,
      },
      body: {
        effective_at: openingDate.toISOString(),
        balance: openingBalance,
      },
    },
  )
}

export function useBulkSetOpeningBalance(
  data: SetOpeningBalanceData,
  { onSuccess }: { onSuccess?: () => Awaitable<void> },
) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWRMutation(
    () => buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
      data,
    }),
    ({ accessToken, apiUrl, businessId, data }) => Promise.all(
      Object.entries(data).map(
        ([accountId, { openingDate, openingBalance }]) => setOpeningBalanceOnAccount({
          accessToken,
          apiUrl,
          businessId,
          accountId,
          openingDate,
          openingBalance,
        })),
    )
      .then(() => onSuccess?.())
      .then(() => true as const),
    {
      revalidate: false,
      throwOnError: false,
    },
  )
}
