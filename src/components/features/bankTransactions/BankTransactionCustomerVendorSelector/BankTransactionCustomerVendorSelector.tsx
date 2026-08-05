import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { type CustomerVendorSchema, makeCustomerVendor } from '@schemas/customerVendor/customerVendor'
import { unsafeAssertUnreachable } from '@utils/shared/switch/assertUnreachable'
import { usePatchBankTransactionCounterparty } from '@api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/patch'
import { useBankTransactionsIsCategorizationEnabledContext } from '@providers/categorization/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
import { CustomerVendorSelector } from '@features/customerVendor/CustomerVendorSelector/CustomerVendorSelector'

type BankTransactionCustomerVendorSelectorProps = {
  bankTransaction: Pick<BankTransaction, 'id' | 'customer' | 'vendor'>
}

export function BankTransactionCustomerVendorSelector({
  bankTransaction,
}: BankTransactionCustomerVendorSelectorProps) {
  const { t } = useTranslation()
  const {
    id: bankTransactionId,
    customer,
    vendor,
  } = bankTransaction

  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  const selectedCustomerVendor = useMemo(
    () => makeCustomerVendor(customer, vendor),
    [customer, vendor],
  )

  const { trigger, isMutating } = usePatchBankTransactionCounterparty({ bankTransactionId })

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
      placeholder={t('bankTransactions:action.set_transaction_customer_vendor', 'Set transaction customer or vendor')}
      isReadOnly={!isCategorizationEnabled}
      isMutating={isMutating || selectedCustomerVendor?._local?.isOptimistic}
    />
  )
}
