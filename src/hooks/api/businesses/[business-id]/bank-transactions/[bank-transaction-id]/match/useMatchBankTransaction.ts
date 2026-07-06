import { useCallback } from 'react'

import { MatchSchema } from '@schemas/bankTransactions/match'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { put } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'

export type MatchBankTransactionBody = {
  match_id: string
  type: 'Confirm_Match'
}

const MatchBankTransactionResponseSchema = UnwrappedDataResponseSchema(MatchSchema)

const matchBankTransaction = put<
  typeof MatchBankTransactionResponseSchema.Encoded,
  MatchBankTransactionBody,
  {
    businessId: string
    bankTransactionId: string
  }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/match`,
)

const MATCH_BANK_TRANSACTION_TAG = '#match-bank-transaction'

type MatchBankTransactionArgs = MatchBankTransactionBody & {
  bankTransactionId: string
}

const useMatchBankTransactionMutation = createMutationHook({
  tags: [MATCH_BANK_TRANSACTION_TAG],
  request: matchBankTransaction,
  argToParams: ({ bankTransactionId }: MatchBankTransactionArgs) => ({ bankTransactionId }),
  argToBody: ({ bankTransactionId: _bankTransactionId, ...body }: MatchBankTransactionArgs) => body,
  schema: MatchBankTransactionResponseSchema,
  swrOptions: { throwOnError: true },
})

export function useMatchBankTransaction() {
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { useBankTransactionsOptions } = useBankTransactionsContext()
  const { forceReloadBackgroundBankTransactions } = useBankTransactionsGlobalCacheActions()

  const mutationResponse = useMatchBankTransactionMutation()

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
