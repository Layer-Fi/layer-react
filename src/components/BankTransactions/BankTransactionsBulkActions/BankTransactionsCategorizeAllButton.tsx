import { Label, Span } from '../../ui/Typography/Text'
import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import { VStack } from '../../ui/Stack/Stack'
import { useCallback, useId, useState } from 'react'
import { Button } from '../../ui/Button/Button'
import { useCountSelectedIds, useSelectedIds, useBulkSelectionActions } from '../../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { BankTransactionCategoryComboBox } from '../../BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { isApiCategorizationAsOption, isCategoryAsOption, type BankTransactionCategoryComboBoxOption } from '../../../components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { useBulkCategorize } from '../../../hooks/useBankTransactions/useBulkCategorize'

type CategorizeMode = 'categorize' | 'recategorize'

interface BankTransactionsCategorizeAllButtonProps {
  mode: CategorizeMode
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
        {mode === 'categorize' ? 'Set category' : 'Re-categorize all'}
      </Button>
      <BaseConfirmationModal
        isOpen={isCategorizeAllModalOpen}
        onOpenChange={handleCategorizeModalClose}
        title={mode === 'categorize' ? 'Categorize all selected transactions?' : 'Recategorize all selected transactions?'}
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
                {`This action will ${mode === 'categorize' ? 'categorize' : 'recategorize'} ${count} selected transactions as ${selectedCategory.original.displayName}.`}
              </Span>
            )}
          </VStack>
        )}
        onConfirm={handleConfirm}
        confirmLabel={mode === 'categorize' ? 'Categorize All' : 'Recategorize All'}
        cancelLabel='Cancel'
        confirmDisabled={!selectedCategory}
        errorText={mode === 'categorize' ? 'Failed to categorize transactions' : 'Failed to recategorize transactions'}
        closeOnConfirm
      />
    </>
  )
}
