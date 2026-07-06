import { useCallback } from 'react'

import { type CustomerSchema } from '@schemas/customer'
import { type VendorSchema } from '@schemas/vendor'
import { patch } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useMinMutatingMutation } from '@hooks/utils/swr/useMinMutatingMutation'

const SET_METADATA_ON_BANK_TRANSACTION_TAG_KEY = '#set-metadata-on-bank-transaction'

type SetMetadataOnBankTransactionBody = {
  vendor_id: string | null
  customer_id: string | null
}

const setMetadataOnBankTransaction = patch<
  Record<string, never>,
  SetMetadataOnBankTransactionBody,
  {
    businessId: string
    bankTransactionId: string
  }
>(({
  businessId,
  bankTransactionId,
}) => `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/metadata`)

type SetMetadataOnBankTransactionArg = {
  vendor: typeof VendorSchema.Type | null
  customer: typeof CustomerSchema.Type | null
}

const useSetMetadataOnBankTransactionMutation = createMutationHook({
  tags: [SET_METADATA_ON_BANK_TRANSACTION_TAG_KEY],
  request: setMetadataOnBankTransaction,
  keyParamNames: ['bankTransactionId'],
  argToBody: ({ vendor, customer }: SetMetadataOnBankTransactionArg) => ({
    vendor_id: vendor?.id ?? null,
    customer_id: customer?.id ?? null,
  }),
  swrOptions: { throwOnError: false },
})

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
