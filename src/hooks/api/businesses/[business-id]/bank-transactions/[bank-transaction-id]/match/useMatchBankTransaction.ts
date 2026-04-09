import { useCallback } from 'react'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import type { BankTransactionMatch } from '@internal-types/bankTransactions'
import { put } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { SWRMutationResult } from '@utils/swr/SWRResponseTypes'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { BANK_ACCOUNTS_TAG_KEY } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { EXTERNAL_ACCOUNTS_TAG_KEY } from '@hooks/api/businesses/[business-id]/external-accounts/useListExternalAccounts'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export type MatchBankTransactionBody = {
  match_id: string
  type: 'Confirm_Match'
}

const matchBankTransaction = put<
  { data: BankTransactionMatch },
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

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [MATCH_BANK_TRANSACTION_TAG],
    }
  }
}

type MatchBankTransactionArgs = MatchBankTransactionBody & {
  bankTransactionId: string
}

export function useMatchBankTransaction() {
  const withLocale = useLocalizedKey()
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

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
    ).then(({ data }) => data),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const mutationResponse = new SWRMutationResult(rawMutationResponse)

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void mutate(key => withSWRKeyTags(
        key,
        ({ tags }) => (
          tags.includes(BANK_ACCOUNTS_TAG_KEY)
          || tags.includes(EXTERNAL_ACCOUNTS_TAG_KEY)
        ),
      ))

      void forceReloadBackgroundBankTransactions(useBankTransactionsOptions)

      void debouncedInvalidateProfitAndLoss()

      return triggerResult
    },
    [originalTrigger, mutate, forceReloadBackgroundBankTransactions, useBankTransactionsOptions, debouncedInvalidateProfitAndLoss],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
