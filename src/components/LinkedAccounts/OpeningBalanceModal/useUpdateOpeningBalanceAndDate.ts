import useSWRMutation from 'swr/mutation'
import { Layer } from '../../../api/layer'
import type { Awaitable } from '../../../types/utility/promises'
import { useAuth } from '../../../hooks/useAuth'
import { useLayerContext } from '../../../contexts/LayerContext'
import { AccountFormBoxData } from '../AccountFormBox/AccountFormBox'

export function useUpdateOpeningBalanceAndDate(
  formState: AccountFormBoxData[],
  { onSuccess }: { onSuccess: () => Awaitable<unknown> },
) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const updateData = ({
    account: { id: accountId },
    openingBalance: openingBalance,
    openingDate: openingDate,
  }: AccountFormBoxData) => {
    if (!openingDate || !openingBalance) {
      return
    }

    return Layer.updateOpeningBalance(
      auth?.apiUrl ?? '',
      auth?.access_token,
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

  return useSWRMutation(
    `/v1/businesses/${businessId}/external-accounts/opening-balance`,
    () => Promise.all(
      formState.map((item) => {
        if (item.openingBalance && item.openingDate && item.isConfirmed) {
          return updateData(item)
        }
      },
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
