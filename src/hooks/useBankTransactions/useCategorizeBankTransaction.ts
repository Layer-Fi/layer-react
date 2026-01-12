import { useCallback } from 'react'
import { Schema } from 'effect'
import type { Key } from 'swr'
import { useSWRConfig } from 'swr'
import type { SWRInfiniteKeyedMutator } from 'swr/infinite'
import useSWRMutation, { type SWRMutationResponse } from 'swr/mutation'

import type { BankTransaction } from '@internal-types/bank_transactions'
import { type CategoryUpdate, type CategoryUpdateEncoded, CategoryUpdateSchema } from '@schemas/bankTransactions/categoryUpdate'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { put } from '@api/layer/authenticated_http'
import { type GetBankTransactionsReturn } from '@api/layer/bankTransactions'
import { BANK_ACCOUNTS_TAG_KEY } from '@hooks/bookkeeping/useBankAccounts'
import { useAuth } from '@hooks/useAuth'
import { useBankTransactionsGlobalCacheActions } from '@hooks/useBankTransactions/useBankTransactions'
import { EXTERNAL_ACCOUNTS_TAG_KEY } from '@hooks/useLinkedAccounts/useListExternalAccounts'
import { useProfitAndLossGlobalInvalidator } from '@hooks/useProfitAndLoss/useProfitAndLossGlobalInvalidator'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const CATEGORIZE_BANK_TRANSACTION_TAG = '#categorize-bank-transaction'

const categorizeBankTransaction = put<
  { data: BankTransaction },
  CategoryUpdateEncoded,
  {
    businessId: string
    bankTransactionId: string
  }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/categorize`,
)

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
      tags: [CATEGORIZE_BANK_TRANSACTION_TAG],
    }
  }
}

type CategorizeBankTransactionArgs = CategoryUpdate & {
  bankTransactionId: string
}

type CategorizeBankTransactionSWRMutationResponse =
  SWRMutationResponse<BankTransaction, unknown, Key, CategorizeBankTransactionArgs>

class CategorizeBankTransactionSWRResponse {
  private swrResponse: CategorizeBankTransactionSWRMutationResponse

  constructor(swrResponse: CategorizeBankTransactionSWRMutationResponse) {
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

export type UseCategorizeBankTransactionOptions = {
  mutateBankTransactions: SWRInfiniteKeyedMutator<
    Array<GetBankTransactionsReturn>
  >
}

export function useCategorizeBankTransaction() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
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
      { arg: { bankTransactionId, ...rest } }: { arg: CategorizeBankTransactionArgs },
    ) => categorizeBankTransaction(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          bankTransactionId,
        },
        body: Schema.encodeSync(CategoryUpdateSchema)(rest),
      },
    ).then(({ data }) => data),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const mutationResponse = new CategorizeBankTransactionSWRResponse(rawMutationResponse)

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void mutate(key => withSWRKeyTags(
        key,
        ({ tags }) => tags.includes(BANK_ACCOUNTS_TAG_KEY)
          || tags.includes(EXTERNAL_ACCOUNTS_TAG_KEY),
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
