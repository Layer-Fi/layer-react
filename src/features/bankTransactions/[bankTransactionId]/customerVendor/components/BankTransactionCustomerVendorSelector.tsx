import { useCallback, useMemo } from 'react'

import type { BankTransaction } from '@internal-types/bank_transactions'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { useSetMetadataOnBankTransaction } from '@features/bankTransactions/[bankTransactionId]/metadata/api/useSetMetadataOnBankTransaction'
import { CustomerVendorSelector } from '@features/customerVendor/components/CustomerVendorSelector'
import { type CustomerVendorSchema, decodeCustomerVendor } from '@features/customerVendor/customerVendorSchemas'

type BankTransactionCustomerVendorSelectorProps = {
  bankTransaction: Pick<BankTransaction, 'id' | 'customer' | 'vendor'>
}

export function BankTransactionCustomerVendorSelector({
  bankTransaction,
}: BankTransactionCustomerVendorSelectorProps) {
  const {
    id: bankTransactionId,
    customer,
    vendor,
  } = bankTransaction

  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  const selectedCustomerVendor = useMemo(
    () => {
      if (customer) {
        return decodeCustomerVendor({
          ...customer,
          customerVendorType: 'CUSTOMER',
        })
      }

      if (vendor) {
        return decodeCustomerVendor({
          ...vendor,
          customerVendorType: 'VENDOR',
        })
      }

      return null
    },
    [
      customer,
      vendor,
    ],
  )

  const { trigger, isMutating } = useSetMetadataOnBankTransaction({ bankTransactionId })

  const triggerSetCustomerVendor = useCallback(
    (customerVendor: typeof CustomerVendorSchema.Type | null) => {
      if (customerVendor === null) {
        void trigger({
          customer: null,
          vendor: null,
        })

        return
      }

      switch (customerVendor.customerVendorType) {
        case 'CUSTOMER':
          void trigger({
            customer: customerVendor,
            vendor: null,
          })

          break

        case 'VENDOR':
          void trigger({
            customer: null,
            vendor: customerVendor,
          })

          break

        default:
          unsafeAssertUnreachable({
            value: customerVendor,
            message: 'Unexpected second party type',
          })
      }
    },
    [trigger],
  )

  return (
    <CustomerVendorSelector
      selectedCustomerVendor={selectedCustomerVendor}
      onSelectedCustomerVendorChange={triggerSetCustomerVendor}
      placeholder='Set transaction customer or vendor'
      isReadOnly={!isCategorizationEnabled}
      isMutating={isMutating || selectedCustomerVendor?._local?.isOptimistic}
    />
  )
}
