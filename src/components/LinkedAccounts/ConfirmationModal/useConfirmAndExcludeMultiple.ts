import useSWRMutation from 'swr/mutation'
import { Layer } from '../../../api/layer'
import type { Awaitable } from '../../../types/utility/promises'
import { useAuth } from '../../../hooks/useAuth'
import { useLayerContext } from '../../../contexts/LayerContext'

export type AccountConfirmExcludeFormState = Record<string, boolean>

export function useConfirmAndExcludeMultiple(
  formState: AccountConfirmExcludeFormState,
  { onSuccess }: { onSuccess: () => Awaitable<unknown> },
) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const exclude = (accountId: string) => {
    return Layer.excludeAccount(
      auth?.apiUrl ?? '',
      auth?.access_token,
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
  const confirm = (accountId: string) => {
    return Layer.confirmAccount(
      auth?.apiUrl ?? '',
      auth?.access_token,
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

  return useSWRMutation(
    `/v1/businesses/${businessId}/external-accounts/bulk`,
    () => Promise.all(
      Object.entries(formState).map(([accountId, isConfirmed]) =>
        isConfirmed ? confirm(accountId) : exclude(accountId),
      ),
    )
      .then(() => onSuccess())
      .then(() => true as const),
    {
      revalidate: false,
      throwOnError: false,
    },
  )
}
