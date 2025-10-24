import { Label, Span } from '../../ui/Typography/Text'
import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import { VStack } from '../../ui/Stack/Stack'
import { useCallback, useId, useState } from 'react'
import { Button } from '../../ui/Button/Button'
import { useCountSelectedIds } from '../../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { isCategoryAsOption, type BankTransactionCategoryComboBoxOption } from '../../BankTransactionCategoryComboBox/options'
import { BankTransactionCategoryComboBox } from '../../BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'

export const BankTransactionsRecategorizeAllButton = () => {
  const { count } = useCountSelectedIds()
  const [isRecategorizeAllModalOpen, setIsRecategorizeAllModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<BankTransactionCategoryComboBoxOption | null>(null)

  const handleRecategorizeAllClick = useCallback(() => {
    setIsRecategorizeAllModalOpen(true)
  }, [])

  const handleRecategorizeModalClose = useCallback((isOpen: boolean) => {
    setIsRecategorizeAllModalOpen(isOpen)
    if (!isOpen) {
      setSelectedCategory(null)
    }
  }, [])

  const categorySelectId = useId()

  return (
    <>
      <Button
        variant='outlined'
        onClick={handleRecategorizeAllClick}
      >
        Re-categorize all
      </Button>
      <BaseConfirmationModal
        isOpen={isRecategorizeAllModalOpen}
        onOpenChange={handleRecategorizeModalClose}
        title='Recategorize all selected transactions?'
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
                {`This action will recategorize ${count} selected transactions as ${selectedCategory?.original.displayName}.`}
              </Span>
            )}
          </VStack>
        )}
        onConfirm={() => {}}
        confirmLabel='Recategorize All'
        cancelLabel='Cancel'
        confirmDisabled={!selectedCategory}
        closeOnConfirm
      />
    </>
  )
}
