import { Label, Span } from '../../ui/Typography/Text'
import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import { VStack } from '../../ui/Stack/Stack'
import { useCallback, useId, useState } from 'react'
import { Button } from '../../ui/Button/Button'
import { useCountSelectedIds } from '../../../providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { BankTransactionCategoryComboBox } from '../../BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { isCategoryAsOption, type BankTransactionCategoryComboBoxOption } from '../../../components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export const BankTransactionsCategorizeAllButton = () => {
  const { count } = useCountSelectedIds()
  const [isCategorizeAllModalOpen, setIsCategorizeAllModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<BankTransactionCategoryComboBoxOption | null>(null)

  const handleCategorizeAllClick = useCallback(() => {
    setIsCategorizeAllModalOpen(true)
  }, [])

  const handleCategorizeModalClose = useCallback((isOpen: boolean) => {
    setIsCategorizeAllModalOpen(isOpen)
    if (!isOpen) {
      setSelectedCategory(null)
    }
  }, [])

  const categorySelectId = useId()

  return (
    <>
      <Button
        variant='outlined'
        onClick={handleCategorizeAllClick}
      >
        Set category
      </Button>
      <BaseConfirmationModal
        isOpen={isCategorizeAllModalOpen}
        onOpenChange={handleCategorizeModalClose}
        title='Categorize all selected transactions?'
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
                {`This action will categorize ${count} selected transactions as ${selectedCategory?.original?.displayName}.`}
              </Span>
            )}
          </VStack>
        )}
        onConfirm={() => {}}
        confirmLabel='Categorize All'
        cancelLabel='Cancel'
        confirmDisabled={!selectedCategory}
        closeOnConfirm
      />
    </>
  )
}
