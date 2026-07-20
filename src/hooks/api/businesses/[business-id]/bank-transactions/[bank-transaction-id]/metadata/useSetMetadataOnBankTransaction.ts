import { useCallback } from 'react'

import { type CustomerSchema } from '@schemas/customer'
import { type VendorSchema } from '@schemas/vendor'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { createBankTransactionMetadataMutationHook } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/useBankTransactionMetadataMutation'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useMinMutatingMutation } from '@hooks/utils/swr/useMinMutatingMutation'

type SetMetadataOnBankTransactionArg = {
  vendor: typeof VendorSchema.Type | null
  customer: typeof CustomerSchema.Type | null
}

const useSetMetadataOnBankTransactionMutation = createBankTransactionMetadataMutationHook(
  ({ vendor, customer }: SetMetadataOnBankTransactionArg) => ({
    vendor_id: vendor?.id ?? null,
    customer_id: customer?.id ?? null,
  }),
)

type UseSetMetadataOnBankTransactionParameters = {
  bankTransactionId: string
}

export function useSetMetadataOnBankTransaction({
  bankTransactionId,
}: UseSetMetadataOnBankTransactionParameters) {
  const rawMutationResponse = useSetMetadataOnBankTransactionMutation({ bankTransactionId })
  const mutationResponse = useMinMutatingMutation({ swrMutationResponse: rawMutationResponse })

  const { debouncedInvalidateBankTransactions, optimisticallyUpdateBankTransactions } = useBankTransactionsGlobalCacheActions()

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResultPromise = originalTrigger(...triggerParameters)

      const { customer, vendor } = triggerParameters[0]

      void optimisticallyUpdateBankTransactions((bankTransaction) => {
        if (bankTransaction.id === bankTransactionId) {
          return {
            ...bankTransaction,
            customer: customer
              ? {
                ...customer,
                _local: {
                  isOptimistic: true,
                },
              }
              : null,
            vendor: vendor
              ? {
                ...vendor,
                _local: {
                  isOptimistic: true,
                },
              }
              : null,
          }
        }

        return bankTransaction
      })

      return triggerResultPromise
        .finally(() => {
          void debouncedInvalidateBankTransactions({
            withPrecedingOptimisticUpdate: true,
          })
        })
    },
    [
      bankTransactionId,
      originalTrigger,
      optimisticallyUpdateBankTransactions,
      debouncedInvalidateBankTransactions,
    ],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
