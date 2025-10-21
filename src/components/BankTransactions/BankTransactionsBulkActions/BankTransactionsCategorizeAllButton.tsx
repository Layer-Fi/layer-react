import { Label, Span } from '../../ui/Typography/Text'
import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import { VStack } from '../../ui/Stack/Stack'
import { useCallback, useId, useState } from 'react'
import { CategoryOption, CategorySelect } from '../../CategorySelect/CategorySelect'
import { Button } from '../../ui/Button/Button'
import { useCountSelectedIds } from '../../../providers/BulkSelectionStore/BulkSelectionStoreProvider'

export const BankTransactionsCategorizeAllButton = () => {
  const { count } = useCountSelectedIds()
  const [isCategorizeAllModalOpen, setIsCategorizeAllModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | undefined>(undefined)

  const handleCategorizeAllClick = useCallback(() => {
    setIsCategorizeAllModalOpen(true)
  }, [])

  const handleCategorizeModalClose = useCallback((isOpen: boolean) => {
    setIsCategorizeAllModalOpen(isOpen)
    if (!isOpen) {
      setSelectedCategory(undefined)
    }
  }, [setSelectedCategory])

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
              <CategorySelect
                name={categorySelectId}
                value={selectedCategory}
                onChange={setSelectedCategory}
                showTooltips={false}
                excludeMatches={true}
              />
            </VStack>
            {selectedCategory && (
              <Span>
                {`This action will categorize ${count} selected transactions as ${selectedCategory?.payload?.display_name}.`}
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
