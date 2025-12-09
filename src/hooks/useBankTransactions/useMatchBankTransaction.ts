import { useCallback } from 'react'
import type { Key } from 'swr'
import { useSWRConfig } from 'swr'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import type { BankTransactionMatch } from '@internal-types/bank_transactions'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { matchBankTransaction, type MatchBankTransactionBody } from '@api/layer/bankTransactions'
import { BANK_ACCOUNTS_TAG_KEY } from '@hooks/bookkeeping/useBankAccounts'
import { useAuth } from '@hooks/useAuth'
import { useBankTransactionsGlobalCacheActions } from '@hooks/useBankTransactions/useBankTransactions'
import { EXTERNAL_ACCOUNTS_TAG_KEY } from '@hooks/useLinkedAccounts/useListExternalAccounts'
import { usePnlDetailLinesInvalidator } from '@hooks/useProfitAndLoss/useProfitAndLossDetailLines'
import { useProfitAndLossGlobalInvalidator } from '@hooks/useProfitAndLoss/useProfitAndLossGlobalInvalidator'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

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

type MatchBankTransactionSWRMutationResponse =
  SWRMutationResponse<BankTransactionMatch, unknown, Key, MatchBankTransactionArgs>

class MatchBankTransactionSWRResponse {
  private swrResponse: MatchBankTransactionSWRMutationResponse

  constructor(swrResponse: MatchBankTransactionSWRMutationResponse) {
    this.swrResponse = swrResponse
  }

  get data() {
    return this.swrResponse.data
  }

  get trigger() {
    return this.swrResponse.trigger
  }

  get isMutating() {
    return this.swrResponse.isMutating
  }

  get error() {
    return this.swrResponse.error
  }

  get isError() {
    return this.swrResponse.error !== undefined
  }
}

export function useMatchBankTransaction() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { invalidatePnlDetailLines } = usePnlDetailLinesInvalidator()
  const { useBankTransactionsOptions } = useBankTransactionsContext()
  const { forceReloadBackgroundBankTransactions } = useBankTransactionsGlobalCacheActions()

  const rawMutationResponse = useSWRMutation(
    () => buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    }),
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

  const mutationResponse = new MatchBankTransactionSWRResponse(rawMutationResponse)

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

      void invalidatePnlDetailLines()
      void debouncedInvalidateProfitAndLoss()

      return triggerResult
    },
    [
      originalTrigger,
      mutate,
      forceReloadBackgroundBankTransactions,
      useBankTransactionsOptions,
      invalidatePnlDetailLines,
      debouncedInvalidateProfitAndLoss,
    ],
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
