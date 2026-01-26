import { useRef } from 'react'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { useBulkSelectionActions, useIdIsSelected } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'
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

  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()

  const { select, deselect } = useBulkSelectionActions()
  const isSelected = useIdIsSelected()
  const isTransactionSelected = isSelected(bankTransaction.id)

  if (!isCategorizationEnabled || !bulkActionsEnabled) {
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
