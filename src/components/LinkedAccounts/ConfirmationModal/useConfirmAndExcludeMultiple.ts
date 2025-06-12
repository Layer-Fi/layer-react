import useSWRMutation from 'swr/mutation'
import { Layer } from '../../../api/layer'
import type { Awaitable } from '../../../types/utility/promises'
import { useAuth } from '../../../hooks/useAuth'
import { useLayerContext } from '../../../contexts/LayerContext'

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
  return Layer.excludeAccount(
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
  return Layer.confirmAccount(
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

  return useSWRMutation<
    boolean,
    Error,
    () => ReturnType<typeof buildKey> | undefined,
    AccountConfirmExcludeFormState
  >(
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
