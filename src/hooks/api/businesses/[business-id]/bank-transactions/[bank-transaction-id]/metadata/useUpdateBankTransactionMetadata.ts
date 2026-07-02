import { useCallback } from 'react'
import { useSWRConfig } from 'swr'

import type { BankTransactionMetadata } from '@internal-types/bankTransactions'
import type { Awaitable } from '@internal-types/utility/promises'
import { put } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { GET_BANK_TRANSACTION_METADATA_TAG_KEY } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/useBankTransactionsMetadata'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const updateBankTransactionMetadata = put<
  { data: BankTransactionMetadata, errors: unknown },
  { memo: string },
  { businessId: string, bankTransactionId: string }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/metadata`,
)

export type UpdateBankTransactionMetadataBody = { memo: string }

const UPDATE_BANK_TRANSACTION_METADATA_TAG_KEY = '#update-bank-transaction-metadata'

const useUpdateBankTransactionMetadataMutation = createMutationHook({
  tags: [UPDATE_BANK_TRANSACTION_METADATA_TAG_KEY],
  request: updateBankTransactionMetadata,
  keyParams: ['bankTransactionId'],
  select: ({ data }) => data,
  swrOptions: { throwOnError: false },
})

export function useUpdateBankTransactionMetadata({ bankTransactionId, onSuccess }: { bankTransactionId: string, onSuccess?: () => Awaitable<unknown> }) {
  const { mutate } = useSWRConfig()

  const mutationResponse = useUpdateBankTransactionMetadataMutation({
    bankTransactionId,
    swrOptions: { onSuccess: () => { void onSuccess?.() } },
  })

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void mutate(key => withSWRKeyTags(
        key,
        ({ tags }) => tags.includes(GET_BANK_TRANSACTION_METADATA_TAG_KEY),
      ))

      return triggerResult
    },
    [
      originalTrigger,
      mutate,
    ],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
