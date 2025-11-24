import { useCallback } from 'react'
import { useSWRConfig } from 'swr'
import type { SWRInfiniteKeyedMutator } from 'swr/infinite'
import useSWRMutation from 'swr/mutation'

import type { CategoryUpdate } from '@internal-types/categories'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { categorizeBankTransaction, type GetBankTransactionsReturn } from '@api/layer/bankTransactions'
import { BANK_ACCOUNTS_TAG_KEY } from '@hooks/bookkeeping/useBankAccounts'
import { useAuth } from '@hooks/useAuth'
import { EXTERNAL_ACCOUNTS_TAG_KEY } from '@hooks/useLinkedAccounts/useListExternalAccounts'
import { usePnlDetailLinesInvalidator } from '@hooks/useProfitAndLoss/useProfitAndLossDetailLines'
import { useProfitAndLossGlobalInvalidator } from '@hooks/useProfitAndLoss/useProfitAndLossGlobalInvalidator'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useBankTransactionsGlobalCacheActions } from './useBankTransactions'

const CATEGORIZE_BANK_TRANSACTION_TAG = '#categorize-bank-transaction'

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

type UseCategorizeBankTransactionOptions = {
  mutateBankTransactions: SWRInfiniteKeyedMutator<
    Array<GetBankTransactionsReturn>
  >
}

export function useCategorizeBankTransaction({
  mutateBankTransactions,
}: UseCategorizeBankTransactionOptions) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { invalidatePnlDetailLines } = usePnlDetailLinesInvalidator()
  const { forceReloadBankTransactions } = useBankTransactionsGlobalCacheActions()
  
  const mutationResponse = useSWRMutation(
    () => buildKey({
      access_token: auth?.access_token,
      apiUrl: auth?.apiUrl,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: { bankTransactionId, ...body } }: { arg: CategorizeBankTransactionArgs },
    ) => categorizeBankTransaction(
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
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void mutate(key => withSWRKeyTags(
        key,
        tags => tags.includes(BANK_ACCOUNTS_TAG_KEY)
          || tags.includes(EXTERNAL_ACCOUNTS_TAG_KEY),
      ))
      /**
       * SWR does not expose infinite queries through the matcher
       *
       * @see https://github.com/vercel/swr/blob/main/src/_internal/utils/mutate.ts#L78
       */
      void mutateBankTransactions(undefined, { revalidate: true })
      void invalidatePnlDetailLines()
      void forceReloadBankTransactions()
      void debouncedInvalidateProfitAndLoss()

      return triggerResult
    },
    [originalTrigger, mutate, mutateBankTransactions, debouncedInvalidateProfitAndLoss, invalidatePnlDetailLines],
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
