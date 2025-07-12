import { useCallback, useMemo } from 'react'
import { CustomerVendorSelector } from '../../../../../customerVendor/components/CustomerVendorSelector'
import { decodeCustomerVendor, type CustomerVendorSchema } from '../../../../../customerVendor/customerVendorSchemas'
import { unsafeAssertUnreachable } from '../../../../../../utils/switch/assertUnreachable'
import { BookkeepingStatus, useEffectiveBookkeepingStatus } from '../../../../../../hooks/bookkeeping/useBookkeepingStatus'
import type { JournalEntry } from '../../../../../../types'
import { useSetMetadataOnLedgerEntry } from '../../metadata/api/useSetMetadataOnLedgerEntry'

type BankTransactionCustomerVendorSelectorProps = {
  journalEntry: Pick<JournalEntry, 'id' | 'customer' | 'vendor'>
}

export function JournalEntryCustomerVendorSelector({
  journalEntry,
}: BankTransactionCustomerVendorSelectorProps) {
  const {
    id: journalEntryId,
    customer,
    vendor,
  } = journalEntry

  const status = useEffectiveBookkeepingStatus()
  const isReadOnly = status === BookkeepingStatus.ACTIVE

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

  const { trigger, isMutating } = useSetMetadataOnLedgerEntry({ ledgerEntryId: journalEntryId })

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
      placeholder='Set a customer or vendor...'
      menuPlacement='top'
      isReadOnly={isReadOnly}
      isMutating={isMutating || selectedCustomerVendor?._local?.isOptimistic}
    />
  )
}
