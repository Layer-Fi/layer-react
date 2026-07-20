import type { BankTransactionMetadata } from '@internal-types/bankTransactions'
import type { Awaitable } from '@internal-types/utility/promises'
import { type BankTransactionMemoUpdateEncoded } from '@schemas/bankTransactions/metadataUpdate'
import { patch } from '@utils/api/authenticatedHttp'
import { useBankTransactionMetadataGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/useBankTransactionsMetadata'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const updateBankTransactionMetadata = patch<
  { data: BankTransactionMetadata, errors: unknown },
  BankTransactionMemoUpdateEncoded,
  { businessId: string, bankTransactionId: string }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/metadata`,
)

export type UpdateBankTransactionMetadataBody = BankTransactionMemoUpdateEncoded

const UPDATE_BANK_TRANSACTION_METADATA_TAG_KEY = '#update-bank-transaction-metadata'

const useUpdateBankTransactionMetadataMutation = createMutationHook({
  tags: [UPDATE_BANK_TRANSACTION_METADATA_TAG_KEY],
  request: updateBankTransactionMetadata,
  keyParams: ['bankTransactionId'],
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
  useOnTriggerSuccess: () => {
    const { invalidate: invalidateBankTransactionMetadata } = useBankTransactionMetadataGlobalCacheActions()
    return () => {
      void invalidateBankTransactionMetadata()
    }
  },
})

export function useUpdateBankTransactionMetadata({ bankTransactionId, onSuccess }: { bankTransactionId: string, onSuccess?: () => Awaitable<unknown> }) {
  return useUpdateBankTransactionMetadataMutation({
    bankTransactionId,
    swrOptions: { onSuccess: () => { void onSuccess?.() } },
  })
}
