import { useCallback } from 'react'
import { Schema } from 'effect'
import type { SWRInfiniteKeyedMutator } from 'swr/infinite'

import { BankTransactionSchema } from '@schemas/bankTransactions/bankTransaction'
import { type CategoryUpdate, type CategoryUpdateEncoded, encodeCategoryUpdate } from '@schemas/bankTransactions/categoryUpdate'
import { put } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { type GetBankTransactionsReturn } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'

const CATEGORIZE_BANK_TRANSACTION_TAG = '#categorize-bank-transaction'

const CategorizeBankTransactionResponseSchema = Schema.Struct({
  data: BankTransactionSchema,
})

const categorizeBankTransaction = put<
  typeof CategorizeBankTransactionResponseSchema.Encoded,
  CategoryUpdateEncoded,
  {
    businessId: string
    bankTransactionId: string
  }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/categorize`,
)

type CategorizeBankTransactionArgs = CategoryUpdate & {
  bankTransactionId: string
}

export type UseCategorizeBankTransactionOptions = {
  mutateBankTransactions: SWRInfiniteKeyedMutator<
    Array<GetBankTransactionsReturn>
  >
}

const useCategorizeBankTransactionMutation = createMutationHook({
  tags: [CATEGORIZE_BANK_TRANSACTION_TAG],
  request: categorizeBankTransaction,
  argToParams: ({ bankTransactionId }: CategorizeBankTransactionArgs) => ({ bankTransactionId }),
  argToBody: ({ bankTransactionId: _bankTransactionId, ...rest }: CategorizeBankTransactionArgs) =>
    encodeCategoryUpdate(rest),
  schema: CategorizeBankTransactionResponseSchema.pipe(Schema.pluck('data')),
  swrOptions: { throwOnError: true },
})

export function useCategorizeBankTransaction() {
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { useBankTransactionsOptions } = useBankTransactionsContext()
  const { forceReloadBackgroundBankTransactions } = useBankTransactionsGlobalCacheActions()

  const mutationResponse = useCategorizeBankTransactionMutation()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void forceReloadBackgroundBankTransactions(useBankTransactionsOptions)

      void debouncedInvalidateProfitAndLoss()

      return triggerResult
    },
    [originalTrigger, forceReloadBackgroundBankTransactions, useBankTransactionsOptions, debouncedInvalidateProfitAndLoss],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
