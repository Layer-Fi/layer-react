import { useCallback, useMemo } from 'react'
import type { BankTransaction } from '../../../../../types'
import { SecondPartySelector } from '../../../../secondParty/components/SecondPartySelector'
import { decodeSecondParty, type SecondPartySchema } from '../../../../secondParty/secondPartySchemas'
import { unsafeAssertUnreachable } from '../../../../../utils/switch/assertUnreachable'
import { BookkeepingStatus, useEffectiveBookkeepingStatus } from '../../../../../hooks/bookkeeping/useBookkeepingStatus'
import { useSetMetadataOnBankTransaction } from '../../metadata/api/useSetMetadataOnBankTransaction'

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

  const { trigger, isMutating } = useSetMetadataOnBankTransaction({ bankTransactionId })

  const triggerSetSecondParty = useCallback(
    (secondParty: typeof SecondPartySchema.Type | null) => {
      if (secondParty === null) {
        void trigger({
          customer: null,
          vendor: null,
        })

        return
      }

      switch (secondParty.secondPartyType) {
        case 'CUSTOMER':
          void trigger({
            customer: secondParty,
            vendor: null,
          })

          break

        case 'VENDOR':
          void trigger({
            customer: null,
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
    [trigger],
  )

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
