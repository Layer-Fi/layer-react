import { Label, Span } from '../../ui/Typography/Text'
import { BaseConfirmationModal } from '../../BaseConfirmationModal/BaseConfirmationModal'
import { VStack } from '../../ui/Stack/Stack'
import { useCallback, useId, useState } from 'react'
import { CategoryOption, CategorySelect } from '../../CategorySelect/CategorySelect'
import { Button } from '../../ui/Button/Button'
import { useCountSelectedIds } from '../../../providers/BulkSelectionStore/BulkSelectionStoreProvider'

export const BankTransactionsRecategorizeAllButton = () => {
  const { count } = useCountSelectedIds()
  const [isRecategorizeAllModalOpen, setIsRecategorizeAllModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | undefined>(undefined)

  const handleRecategorizeAllClick = useCallback(() => {
    setIsRecategorizeAllModalOpen(true)
  }, [])

  const handleRecategorizeModalClose = useCallback((isOpen: boolean) => {
    setIsRecategorizeAllModalOpen(isOpen)
    if (!isOpen) {
      setSelectedCategory(undefined)
    }
  }, [setSelectedCategory])

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
                {`This action will recategorize ${count} selected transactions as ${selectedCategory?.payload?.display_name}.`}
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
