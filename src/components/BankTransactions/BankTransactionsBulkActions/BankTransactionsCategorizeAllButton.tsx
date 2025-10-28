import { Label, Span } from '../../ui/Typography/Text'
import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import { VStack } from '../../ui/Stack/Stack'
import { useCallback, useId, useState } from 'react'
import { Button } from '../../ui/Button/Button'
import { useCountSelectedIds, useSelectedIds, useBulkSelectionActions } from '../../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { BankTransactionCategoryComboBox } from '../../BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { isApiCategorizationAsOption, isCategoryAsOption, type BankTransactionCategoryComboBoxOption } from '../../../components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { useBulkCategorize } from '../../../hooks/useBankTransactions/useBulkCategorize'
import pluralize from 'pluralize'

export enum CategorizationMode {
  Categorize = 'Categorize',
  Recategorize = 'Recategorize',
}

interface BankTransactionsCategorizeAllButtonProps {
  mode: CategorizationMode
}

export const BankTransactionsCategorizeAllButton = ({ mode }: BankTransactionsCategorizeAllButtonProps) => {
  const { count } = useCountSelectedIds()
  const { selectedIds } = useSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const [isCategorizeAllModalOpen, setIsCategorizeAllModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<BankTransactionCategoryComboBoxOption | null>(null)
  const { trigger } = useBulkCategorize()

  const handleCategorizeAllClick = useCallback(() => {
    setIsCategorizeAllModalOpen(true)
  }, [])

  const handleCategorizeModalClose = useCallback((isOpen: boolean) => {
    setIsCategorizeAllModalOpen(isOpen)
    if (!isOpen) {
      setSelectedCategory(null)
    }
  }, [])

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
    <>
      <Button
        variant='outlined'
        onClick={handleCategorizeAllClick}
      >
        {mode === CategorizationMode.Categorize ? 'Set category' : 'Recategorize all'}
      </Button>
      <BaseConfirmationModal
        isOpen={isCategorizeAllModalOpen}
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
    </>
  )
}
