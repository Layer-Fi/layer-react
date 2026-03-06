import useSWRMutation from 'swr/mutation'

import type { Awaitable } from '@internal-types/utility/promises'
import { confirmAccountApi, excludeAccountApi } from '@hooks/legacy/useLinkedAccounts'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export type AccountConfirmExcludeFormState = Record<string, boolean>

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: ['#bulk-confirm', '#bulk-exclude'],
    }
  }
}

function exclude({
  apiUrl,
  accessToken,
  businessId,
  accountId,
}: {
  apiUrl: string
  accessToken: string
  businessId: string
  accountId: string
}) {
  return excludeAccountApi(
    apiUrl,
    accessToken,
    {
      params: {
        businessId,
        accountId,
      },
      body: {
        is_irrelevant: true,
      },
    },
  )
}

function confirm({
  apiUrl,
  accessToken,
  businessId,
  accountId,
}: {
  apiUrl: string
  accessToken: string
  businessId: string
  accountId: string
}) {
  return confirmAccountApi(
    apiUrl,
    accessToken,
    {
      params: {
        businessId,
        accountId,
      },
      body: {
        is_relevant: true,
      },
    },
  )
}

export function useConfirmAndExcludeMultiple({ onSuccess }: { onSuccess?: () => Awaitable<unknown> }) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWRMutation(
    () => buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg }: { arg: AccountConfirmExcludeFormState },
    ) => Promise.all(
      Object.entries(arg).map(([accountId, isConfirmed]) =>
        isConfirmed
          ? confirm({ accessToken, apiUrl, accountId, businessId })
          : exclude({ accessToken, apiUrl, accountId, businessId }),
      ),
    )
      .then(() => onSuccess?.())
      .then(() => true as const),
    {
      revalidate: false,
      throwOnError: false,
    },
  )
}
