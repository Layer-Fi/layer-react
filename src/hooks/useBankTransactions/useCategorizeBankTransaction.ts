import { useCallback } from 'react'
import { categorizeBankTransaction } from '../../api/layer/bankTransactions'
import { useLayerContext } from '../../contexts/LayerContext'
import type { CategoryUpdate } from '../../types'
import { useAuth } from '../useAuth'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'
import { withSWRKeyTags } from '../../utils/swr/withSWRKeyTags'
import { BANK_ACCOUNTS_TAG_KEY } from '../bookkeeping/useBankAccounts'
import { EXTERNAL_ACCOUNTS_TAG_KEY } from '../useLinkedAccounts/useListExternalAccounts'
import { useBankTransactionsInvalidator } from './useBankTransactions'

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

export function useCategorizeBankTransaction() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

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

  const { invalidateBankTransactions } = useBankTransactionsInvalidator()

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResultPromise = originalTrigger(...triggerParameters)

      return triggerResultPromise.finally(() => {
        void invalidateBankTransactions()
        void mutate(key => withSWRKeyTags(
          key,
          tags => (
            tags.includes(BANK_ACCOUNTS_TAG_KEY)
            || tags.includes(EXTERNAL_ACCOUNTS_TAG_KEY)
          ),
        ))
      })
    },
    [
      originalTrigger,
      mutate,
      invalidateBankTransactions,
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
