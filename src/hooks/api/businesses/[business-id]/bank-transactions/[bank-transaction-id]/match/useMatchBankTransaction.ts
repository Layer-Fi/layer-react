import { useCallback } from 'react'
import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { MatchSchema } from '@schemas/bankTransactions/match'
import { put } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'

export type MatchBankTransactionBody = {
  match_id: string
  type: 'Confirm_Match'
}

const MatchBankTransactionResponseSchema = Schema.Struct({
  data: MatchSchema,
})

const matchBankTransaction = put<
  Record<string, unknown>,
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

const buildKey = createBuildKey<{ businessId: string }>([MATCH_BANK_TRANSACTION_TAG])

type MatchBankTransactionArgs = MatchBankTransactionBody & {
  bankTransactionId: string
}

export function useMatchBankTransaction() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { useBankTransactionsOptions } = useBankTransactionsContext()
  const { forceReloadBackgroundBankTransactions } = useBankTransactionsGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    })),
    (
      { accessToken, apiUrl, businessId },
      { arg: { bankTransactionId, ...body } }: { arg: MatchBankTransactionArgs },
    ) => matchBankTransaction(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          bankTransactionId,
        },
        body,
      },
    )
      .then(Schema.decodeUnknownPromise(MatchBankTransactionResponseSchema))
      .then(({ data }) => data),
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)

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
