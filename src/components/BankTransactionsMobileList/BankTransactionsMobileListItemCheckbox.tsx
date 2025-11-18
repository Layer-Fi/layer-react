import { useRef } from 'react'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { isCategorizationEnabledForStatus } from '@utils/bookkeeping/isCategorizationEnabled'
import { useEffectiveBookkeepingStatus } from '@hooks/bookkeeping/useBookkeepingStatus'
import { useBulkSelectionActions, useIdIsSelected } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { VStack } from '@ui/Stack/Stack'

export interface BankTransactionsMobileListItemCheckboxProps {
  bulkActionsEnabled: boolean
  bankTransaction: BankTransaction
  checkboxContainerRef?: React.RefObject<HTMLDivElement>
}

export const BankTransactionsMobileListItemCheckbox = ({
  bulkActionsEnabled,
  bankTransaction,
  checkboxContainerRef,
}: BankTransactionsMobileListItemCheckboxProps) => {
  const internalRef = useRef<HTMLDivElement>(null)
  const ref = checkboxContainerRef || internalRef

  const bookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizationEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)

  const { select, deselect } = useBulkSelectionActions()
  const isSelected = useIdIsSelected()
  const isTransactionSelected = isSelected(bankTransaction.id)

  if (!categorizationEnabled || !bulkActionsEnabled) {
    return null
  }

  return (
    <VStack align='start' pis='md' pie='2xs' ref={ref}>
      <Checkbox
        size='md'
        isSelected={isTransactionSelected}
        onChange={(selected) => {
          if (selected) {
            select(bankTransaction.id)
          }
          else {
            deselect(bankTransaction.id)
          }
        }}
      />
    </VStack>
  )
}
