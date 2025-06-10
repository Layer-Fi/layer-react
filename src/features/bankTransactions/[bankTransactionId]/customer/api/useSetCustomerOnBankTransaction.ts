import useSWRMutation from 'swr/mutation'
import { useAuth } from '../../../../../hooks/useAuth'
import { useLayerContext } from '../../../../../contexts/LayerContext'
import { patch } from '../../../../../api/layer/authenticated_http'
import { useBankTransactionsInvalidator, useBankTransactionsOptimisticUpdater } from '../../../../../hooks/useBankTransactions/useBankTransactions'
import { useCallback } from 'react'
import { CustomerSchema, encodeCustomer } from '../../../../customers/customersSchemas'

const SET_CUSTOMER_ON_BANK_TRANSACTION_TAG_KEY = '#set-customer-on-bank-transaction'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  bankTransactionId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  bankTransactionId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      bankTransactionId,
      tags: [SET_CUSTOMER_ON_BANK_TRANSACTION_TAG_KEY],
    } as const
  }
}

type SetCustomerOnBankTransactionBody = {
  customer_id: string | null
}

const setCustomerOnBankTransaction = patch<
  Record<string, never>,
  SetCustomerOnBankTransactionBody,
  {
    businessId: string
    bankTransactionId: string
  }
>(({
  businessId,
  bankTransactionId,
}) => `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/metadata`)

type SetCustomerOnBankTransactionArg = {
  customer: typeof CustomerSchema.Type | null
}

type UseSetCustomerOnBankTransactionParameters = {
  bankTransactionId: string
}

export function useSetCustomerOnBankTransaction({
  bankTransactionId,
}: UseSetCustomerOnBankTransactionParameters) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      bankTransactionId,
    }),
    (
      { accessToken, apiUrl, businessId, bankTransactionId },
      { arg: { customer } }: { arg: SetCustomerOnBankTransactionArg },
    ) => setCustomerOnBankTransaction(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          bankTransactionId,
        },
        body: {
          customer_id: customer?.id ?? null,
        },
      },
    ),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const { optimisticallyUpdateBankTransactions } = useBankTransactionsOptimisticUpdater()
  const { debouncedInvalidateBankTransactions } = useBankTransactionsInvalidator()

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResultPromise = originalTrigger(...triggerParameters)

      void optimisticallyUpdateBankTransactions((bankTransaction) => {
        if (bankTransaction.id === bankTransactionId) {
          const { customer } = triggerParameters[0]

          return {
            ...bankTransaction,
            customer: customer
              ? encodeCustomer(customer)
              : null,
          }
        }

        return bankTransaction
      })

      return triggerResultPromise
        .finally(() => { void debouncedInvalidateBankTransactions() })
    },
    [
      bankTransactionId,
      originalTrigger,
      optimisticallyUpdateBankTransactions,
      debouncedInvalidateBankTransactions,
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
