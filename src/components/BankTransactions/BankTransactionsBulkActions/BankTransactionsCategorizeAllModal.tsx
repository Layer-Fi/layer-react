import { Label, Span } from '../../ui/Typography/Text'
import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import { VStack } from '../../ui/Stack/Stack'
import { useCallback, useId, useState } from 'react'
import { useCountSelectedIds, useSelectedIds, useBulkSelectionActions } from '../../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { BankTransactionCategoryComboBox } from '../../BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { isApiCategorizationAsOption, isCategoryAsOption, type BankTransactionCategoryComboBoxOption } from '../../BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { useBulkCategorize } from '../../../hooks/useBankTransactions/useBulkCategorize'
import pluralize from 'pluralize'
import { CategorizationMode } from './BankTransactionsCategorizeAllButton'

interface BankTransactionsCategorizeAllModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  mode: CategorizationMode
}

export const BankTransactionsCategorizeAllModal = ({ isOpen, onOpenChange, mode }: BankTransactionsCategorizeAllModalProps) => {
  const { count } = useCountSelectedIds()
  const { selectedIds } = useSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const [selectedCategory, setSelectedCategory] = useState<BankTransactionCategoryComboBoxOption | null>(null)
  const { trigger } = useBulkCategorize()

  const handleCategorizeModalClose = useCallback((isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setSelectedCategory(null)
    }
  }, [onOpenChange])

  const handleConfirm = useCallback(async () => {
    if (!selectedCategory || selectedCategory.classification === null) {
      return
    }

    if (!isCategoryAsOption(selectedCategory) && !isApiCategorizationAsOption(selectedCategory)) {
      return
    }

    const transactionIds = Array.from(selectedIds)
    const categorization = {
      type: 'Category' as const,
      category: selectedCategory.classification,
    }

    await trigger({
      transactions: transactionIds.map(transactionId => ({
        transactionId,
        categorization,
      })),
    })

    clearSelection()
  }, [selectedIds, selectedCategory, trigger, clearSelection])

  const categorySelectId = useId()

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={handleCategorizeModalClose}
      title={mode === CategorizationMode.Categorize ? 'Categorize all selected transactions?' : 'Recategorize all selected transactions?'}
      content={(
        <VStack gap='xs'>
          <VStack gap='3xs'>
            <Label htmlFor={categorySelectId}>Select category</Label>
            <BankTransactionCategoryComboBox
              inputId={categorySelectId}
              selectedValue={selectedCategory}
              onSelectedValueChange={setSelectedCategory}
              includeSuggestedMatches={false}
            />
          </VStack>
          {selectedCategory && isCategoryAsOption(selectedCategory) && (
            <Span>

              {mode === CategorizationMode.Categorize
                ? `This action will categorize ${count} selected ${pluralize('transaction', count)} as ${selectedCategory.original.displayName}.`
                : `This action will recategorize ${count} selected ${pluralize('transaction', count)} as ${selectedCategory.original.displayName}.`}
            </Span>
          )}
        </VStack>
      )}
      onConfirm={handleConfirm}
      confirmLabel={mode === CategorizationMode.Categorize ? 'Categorize All' : 'Recategorize All'}
      cancelLabel='Cancel'
      confirmDisabled={!selectedCategory}
      errorText={mode === CategorizationMode.Categorize ? 'Failed to categorize transactions' : 'Failed to recategorize transactions'}
      closeOnConfirm
    />
  )
}
