import { useRef } from 'react'
import { useEffectiveBookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'
import { isCategorizationEnabledForStatus } from '../../utils/bookkeeping/isCategorizationEnabled'
import { VStack } from '../ui/Stack/Stack'
import { Checkbox } from '../ui/Checkbox/Checkbox'
import { useBulkSelectionActions, useIdIsSelected } from '../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { BankTransaction } from '../../types/bank_transactions'

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
