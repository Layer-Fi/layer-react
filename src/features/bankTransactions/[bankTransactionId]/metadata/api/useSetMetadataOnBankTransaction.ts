import useSWRMutation from 'swr/mutation'
import { useAuth } from '../../../../../hooks/useAuth'
import { useLayerContext } from '../../../../../contexts/LayerContext'
import { patch } from '../../../../../api/layer/authenticated_http'
import { useCallback } from 'react'
import { useBankTransactionsInvalidator, useBankTransactionsOptimisticUpdater } from '../../../../../hooks/useBankTransactions/useBankTransactions'
import { encodeVendor, type VendorSchema } from '../../../../../schemas/vendor'
import { encodeCustomer, type CustomerSchema } from '../../../../../schemas/customer'
import { useMinMutatingMutation } from '../../../../../hooks/mutation/useMinMutatingMutation'

const SET_METADATA_ON_BANK_TRANSACTION_TAG_KEY = '#set-metadata-on-bank-transaction'

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
      tags: [SET_METADATA_ON_BANK_TRANSACTION_TAG_KEY],
    } as const
  }
}

type SetMetadataOnBankTransactionBody = {
  vendor_id: string | null
  customer_id: string | null
}

const setMetadataOnBankTransaction = patch<
  Record<string, never>,
  SetMetadataOnBankTransactionBody,
  {
    businessId: string
    bankTransactionId: string
  }
>(({
  businessId,
  bankTransactionId,
}) => `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/metadata`)

type SetMetadataOnBankTransactionArg = {
  vendor: typeof VendorSchema.Type | null
  customer: typeof CustomerSchema.Type | null
}

type UseSetMetadataOnBankTransactionParameters = {
  bankTransactionId: string
}

export function useSetMetadataOnBankTransaction({
  bankTransactionId,
}: UseSetMetadataOnBankTransactionParameters) {
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
      { arg: { vendor, customer } }: { arg: SetMetadataOnBankTransactionArg },
    ) => setMetadataOnBankTransaction(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          bankTransactionId,
        },
        body: {
          vendor_id: vendor?.id ?? null,
          customer_id: customer?.id ?? null,
        },
      },
    ),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const { debouncedInvalidateBankTransactions } = useBankTransactionsInvalidator()
  const { optimisticallyUpdateBankTransactions } = useBankTransactionsOptimisticUpdater()

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResultPromise = originalTrigger(...triggerParameters)

      const { customer, vendor } = triggerParameters[0]

      void optimisticallyUpdateBankTransactions((bankTransaction) => {
        if (bankTransaction.id === bankTransactionId) {
          return {
            ...bankTransaction,
            customer: customer
              ? encodeCustomer({
                ...customer,
                _local: {
                  isOptimistic: true,
                },
              })
              : null,
            vendor: vendor
              ? encodeVendor({
                ...vendor,
                _local: {
                  isOptimistic: true,
                },
              })
              : null,
          }
        }

        return bankTransaction
      })

      return triggerResultPromise
        .finally(() => {
          void debouncedInvalidateBankTransactions({
            withPrecedingOptimisticUpdate: true,
          })
        })
    },
    [
      bankTransactionId,
      originalTrigger,
      optimisticallyUpdateBankTransactions,
      debouncedInvalidateBankTransactions,
    ],
  )

  const baseProxiedResponse = new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })

  return useMinMutatingMutation({ swrMutationResponse: baseProxiedResponse })
}
