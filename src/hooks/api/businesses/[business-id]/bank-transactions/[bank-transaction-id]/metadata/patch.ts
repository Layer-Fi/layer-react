import { useCallback } from 'react'
import { Schema } from 'effect'

import type { Awaitable } from '@internal-types/utility/promises'
import { type BankTransactionMetadataUpdateEncoded } from '@schemas/bankTransactions/metadataUpdate'
import { type CustomerSchema } from '@schemas/customer'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { type VendorSchema } from '@schemas/vendor'
import { patch } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBankTransactionsGlobalCacheActions } from '@api/businesses/[business-id]/bank-transactions/get'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useMinMutatingMutation } from '@hooks/utils/swr/useMinMutatingMutation'

const BANK_TRANSACTION_METADATA_MUTATION_TAG_KEY = '#bank-transaction-metadata-mutation'

const BankTransactionMetadataResponseSchema = UnwrappedDataResponseSchema(
  Schema.Struct({ memo: Schema.NullishOr(Schema.String) }),
)

type BankTransactionMetadataResponseEncoded = typeof BankTransactionMetadataResponseSchema.Encoded

const patchBankTransactionMetadata = patch<
  BankTransactionMetadataResponseEncoded,
  BankTransactionMetadataUpdateEncoded,
  { businessId: string, bankTransactionId: string }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/metadata`,
)

/**
 * Shared base for the bank-transaction metadata PATCH endpoint. Both the memo and
 * counterparty mutations partial-update the same record; each wrapper supplies its
 * own `argToBody` (so its public trigger shape is preserved) and its own cache
 * side effects, while the transport and full-metadata response decode live here.
 */
const createBankTransactionMetadataMutationHook = <TArg>(
  argToBody: (arg: TArg) => BankTransactionMetadataUpdateEncoded,
) =>
  createMutationHook({
    tags: [BANK_TRANSACTION_METADATA_MUTATION_TAG_KEY],
    request: patchBankTransactionMetadata,
    keyParams: ['bankTransactionId'],
    argToBody,
    schema: BankTransactionMetadataResponseSchema,
    swrOptions: { throwOnError: false },
  })

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

type UpdateMemoArg = { memo: string }

const useUpdateBankTransactionMetadataMutation = createBankTransactionMetadataMutationHook(
  ({ memo }: UpdateMemoArg) => ({ memo }),
)

export function usePatchBankTransactionMetadata({ bankTransactionId, onSuccess }: { bankTransactionId: string, onSuccess?: () => Awaitable<unknown> }) {
  return useUpdateBankTransactionMetadataMutation({
    bankTransactionId,
    swrOptions: {
      onSuccess: () => {
        void onSuccess?.()
      },
    },
  })
}
