import { useCallback } from 'react'
import type { Key } from 'swr'
import { useSWRConfig } from 'swr'
import type { SWRInfiniteKeyedMutator } from 'swr/infinite'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import type { BankTransactionMatch } from '@internal-types/bank_transactions'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { type GetBankTransactionsReturn, matchBankTransaction, type MatchBankTransactionBody } from '@api/layer/bankTransactions'
import { BANK_ACCOUNTS_TAG_KEY } from '@hooks/bookkeeping/useBankAccounts'
import { useAuth } from '@hooks/useAuth'
import { EXTERNAL_ACCOUNTS_TAG_KEY } from '@hooks/useLinkedAccounts/useListExternalAccounts'
import { useProfitAndLossGlobalInvalidator } from '@hooks/useProfitAndLoss/useProfitAndLossGlobalInvalidator'
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

type UseMatchBankTransactionOptions = {
  mutateBankTransactions: SWRInfiniteKeyedMutator<
    Array<GetBankTransactionsReturn>
  >
}

export function useMatchBankTransaction({
  mutateBankTransactions,
}: UseMatchBankTransactionOptions) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

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
        tags => (
          tags.includes(BANK_ACCOUNTS_TAG_KEY)
          || tags.includes(EXTERNAL_ACCOUNTS_TAG_KEY)
        ),
      ))
      /**
       * SWR does not expose infinite queries through the matcher
       *
       * @see https://github.com/vercel/swr/blob/main/src/_internal/utils/mutate.ts#L78
       */
      void mutateBankTransactions(undefined, { revalidate: true })

      void debouncedInvalidateProfitAndLoss()

      return triggerResult
    },
    [originalTrigger, mutate, mutateBankTransactions, debouncedInvalidateProfitAndLoss],
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
