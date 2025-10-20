import { useCallback, useId, useState } from 'react'
import { HStack, VStack } from '../ui/Stack/Stack'
import { Button } from '../ui/Button/Button'
import { BaseConfirmationModal } from '../BaseConfirmationModal/BaseConfirmationModal'
import { CategorySelect, CategoryOption } from '../CategorySelect/CategorySelect'
import { Label, Span } from '../ui/Typography/Text'
import pluralize from 'pluralize'

export interface BankTransactionsBulkActionsProps {
  count: number
}

export const BankTransactionsBulkActions = ({ count }: BankTransactionsBulkActionsProps) => {
  const [isConfirmAllModalOpen, setIsConfirmAllModalOpen] = useState(false)
  const [isCategorizeAllModalOpen, setIsCategorizeAllModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | undefined>(undefined)

  const handleConfirmAllClick = useCallback(() => {
    setIsConfirmAllModalOpen(true)
  }, [])

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

    <HStack pis='3xl' align='center' gap='xs'>
      <Button
        variant='solid'
        onClick={handleConfirmAllClick}
      >
        Confirm all
      </Button>
      <BaseConfirmationModal
        isOpen={isConfirmAllModalOpen}
        onOpenChange={setIsConfirmAllModalOpen}
        title='Confirm all suggestions?'
        content={(
          <Span>
            {`This action will confirm ${count} selected ${pluralize('transaction', count)}.`}
          </Span>
        )}
        onConfirm={() => {}}
        confirmLabel='Confirm All'
        cancelLabel='Cancel'
        closeOnConfirm
      />
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
                className='Layer__category-select--modal'
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
    </HStack>
  )
}
