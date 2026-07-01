import { useCallback } from 'react'
import useSWRMutation from 'swr/mutation'

import { type CustomerSchema } from '@schemas/customer'
import { type VendorSchema } from '@schemas/vendor'
import { patch } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'
import { useMinMutatingMutation } from '@hooks/utils/swr/useMinMutatingMutation'

const SET_METADATA_ON_BANK_TRANSACTION_TAG_KEY = '#set-metadata-on-bank-transaction'

const buildKey = createBuildKey<{ businessId: string, bankTransactionId: string }>([SET_METADATA_ON_BANK_TRANSACTION_TAG_KEY])

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

type UseSetMetadataOnBankTransactionParameters = {
  bankTransactionId: string
}

export function useSetMetadataOnBankTransaction({
  bankTransactionId,
}: UseSetMetadataOnBankTransactionParameters) {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...auth,
      businessId,
      bankTransactionId,
    })),
    (
      { accessToken, apiUrl, businessId, bankTransactionId },
      { arg: { vendor, customer } }: { arg: SetMetadataOnBankTransactionArg },
    ) => setMetadataOnBankTransaction(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          bankTransactionId,
        },
        body: {
          vendor_id: vendor?.id ?? null,
          customer_id: customer?.id ?? null,
        },
      },
    ),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

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

  const baseProxiedResponse = withStableTrigger(mutationResponse, stableProxiedTrigger)

  return useMinMutatingMutation({ swrMutationResponse: baseProxiedResponse })
}
