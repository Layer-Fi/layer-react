import useSWRMutation from 'swr/mutation'
import { useAuth } from '../../../../../hooks/useAuth'
import { useLayerContext } from '../../../../../contexts/LayerContext'
import { patch } from '../../../../../api/layer/authenticated_http'
import { useCallback } from 'react'
import { useBankTransactionsInvalidator, useBankTransactionsOptimisticUpdater } from '../../../../../hooks/useBankTransactions/useBankTransactions'
import { encodeVendor, type VendorSchema } from '../../../../vendors/vendorsSchemas'

const SET_VENDOR_ON_BANK_TRANSACTION_TAG_KEY = '#set-vendor-on-bank-transaction'

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
      tags: [SET_VENDOR_ON_BANK_TRANSACTION_TAG_KEY],
    } as const
  }
}

type SetVendorOnBankTransactionBody = {
  vendor_id: string | null
}

const setVendorOnBankTransaction = patch<
  Record<string, never>,
  SetVendorOnBankTransactionBody,
  {
    businessId: string
    bankTransactionId: string
  }
>(({
  businessId,
  bankTransactionId,
}) => `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/metadata`)

type SetVendorOnBankTransactionArg = {
  vendor: typeof VendorSchema.Type | null
}

type UseSetVendorOnBankTransactionParameters = {
  bankTransactionId: string
}

export function useSetVendorOnBankTransaction({
  bankTransactionId,
}: UseSetVendorOnBankTransactionParameters) {
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
      { arg: { vendor } }: { arg: SetVendorOnBankTransactionArg },
    ) => setVendorOnBankTransaction(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          bankTransactionId,
        },
        body: {
          vendor_id: vendor?.id ?? null,
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

      void optimisticallyUpdateBankTransactions((bankTransaction) => {
        if (bankTransaction.id === bankTransactionId) {
          const { vendor } = triggerParameters[0]

          return {
            ...bankTransaction,
            vendor: vendor
              ? encodeVendor(vendor)
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
