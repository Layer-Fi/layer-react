import type { Awaitable } from '@internal-types/utility/promises'
import { createBankTransactionMetadataMutationHook } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/useBankTransactionMetadataMutation'

type UpdateMemoArg = { memo: string }

const useUpdateBankTransactionMetadataMutation = createBankTransactionMetadataMutationHook(
  ({ memo }: UpdateMemoArg) => ({ memo }),
)

export function useUpdateBankTransactionMetadata({ bankTransactionId, onSuccess }: { bankTransactionId: string, onSuccess?: () => Awaitable<unknown> }) {
  return useUpdateBankTransactionMetadataMutation({
    bankTransactionId,
    swrOptions: {
      onSuccess: () => {
        void onSuccess?.()
      },
    },
  })
}
