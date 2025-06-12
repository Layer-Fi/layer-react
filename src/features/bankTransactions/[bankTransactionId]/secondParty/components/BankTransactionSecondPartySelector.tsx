import { useCallback, useMemo } from 'react'
import type { BankTransaction } from '../../../../../types'
import { SecondPartySelector } from '../../../../secondParty/components/SecondPartySelector'
import { useSetCustomerOnBankTransaction } from '../../customer/api/useSetCustomerOnBankTransaction'
import { useSetVendorOnBankTransaction } from '../../vendor/api/useSetVendorOnBankTransaction'
import { decodeSecondParty, type SecondPartySchema } from '../../../../secondParty/secondPartySchemas'
import { unsafeAssertUnreachable } from '../../../../../utils/switch/assertUnreachable'
import { BookkeepingStatus, useEffectiveBookkeepingStatus } from '../../../../../hooks/bookkeeping/useBookkeepingStatus'

type BankTransactionSecondPartySelectorProps = {
  bankTransaction: Pick<BankTransaction, 'id' | 'customer' | 'vendor'>
}

export function BankTransactionSecondPartySelector({
  bankTransaction,
}: BankTransactionSecondPartySelectorProps) {
  const {
    id: bankTransactionId,
    customer,
    vendor,
  } = bankTransaction

  const status = useEffectiveBookkeepingStatus()
  const isReadOnly = status === BookkeepingStatus.ACTIVE

  const {
    trigger: triggerSetCustomerOnBankTransaction,
    isMutating: isMutatingCustomer,
  } = useSetCustomerOnBankTransaction({ bankTransactionId })

  const {
    trigger: triggerSetVendorOnBankTransaction,
    isMutating: isMutatingVendor,
  } = useSetVendorOnBankTransaction({ bankTransactionId })

  const selectedSecondParty = useMemo(
    () => {
      if (customer) {
        return decodeSecondParty({
          ...customer,
          secondPartyType: 'CUSTOMER',
        })
      }

      if (vendor) {
        return decodeSecondParty({
          ...vendor,
          secondPartyType: 'VENDOR',
        })
      }

      return null
    },
    [
      customer,
      vendor,
    ],
  )

  const triggerSetSecondParty = useCallback(
    (secondParty: typeof SecondPartySchema.Type | null) => {
      if (secondParty === null) {
        void triggerSetCustomerOnBankTransaction({
          customer: null,
        })
        void triggerSetVendorOnBankTransaction({
          vendor: null,
        })

        return
      }

      switch (secondParty.secondPartyType) {
        case 'CUSTOMER':
          void triggerSetCustomerOnBankTransaction({
            customer: secondParty,
          })
          break

        case 'VENDOR':
          void triggerSetVendorOnBankTransaction({
            vendor: secondParty,
          })
          break

        default:
          unsafeAssertUnreachable({
            value: secondParty,
            message: 'Unexpected second party type',
          })
      }
    },
    [
      triggerSetCustomerOnBankTransaction,
      triggerSetVendorOnBankTransaction,
    ],
  )

  const isMutating = isMutatingCustomer || isMutatingVendor
  const selectedValueIsOptimistic = Boolean(selectedSecondParty?._local?.isOptimistic)

  return (
    <SecondPartySelector
      selectedSecondParty={selectedSecondParty}
      onSelectedSecondPartyChange={triggerSetSecondParty}
      isMutating={isMutating || selectedValueIsOptimistic}
      isReadOnly={isReadOnly}
    />
  )
}
