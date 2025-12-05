import { useCallback, useId, useState } from 'react'
import pluralize from 'pluralize'

import { useBulkCategorize } from '@hooks/useBankTransactions/useBulkCategorize'
import { useBulkSelectionActions, useCountSelectedIds, useSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { type BankTransactionCategoryComboBoxOption, isApiCategorizationAsOption, isCategoryAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { CategorySelectDrawerWithTrigger } from '@components/CategorySelect/CategorySelectDrawerWithTrigger'
import { ResponsiveConfirmationModal } from '@components/ConfirmationModal/ResponsiveConfirmationModal/ResponsiveConfirmationModal'

export enum CategorizationMode {
  Categorize = 'Categorize',
  Recategorize = 'Recategorize',
}

interface BankTransactionsCategorizeAllModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  mode: CategorizationMode
  isMobileView?: boolean
}

export const BankTransactionsCategorizeAllModal = ({
  isOpen,
  onOpenChange,
  mode,
  isMobileView = false,
}: BankTransactionsCategorizeAllModalProps) => {
  const { count } = useCountSelectedIds()
  const { selectedIds } = useSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const [selectedCategory, setSelectedCategory] = useState<BankTransactionCategoryComboBoxOption | null>(null)
  const { trigger, isMutating } = useBulkCategorize()

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
    <ResponsiveConfirmationModal
      isOpen={isOpen}
      onOpenChange={handleCategorizeModalClose}
      title={mode === CategorizationMode.Categorize ? 'Categorize all selected transactions?' : 'Recategorize all selected transactions?'}
      content={(
        <VStack gap='xs'>
          <VStack gap='3xs'>
            <Label size='sm' htmlFor={categorySelectId}>Select category</Label>
            {isMobileView
              ? (
                <CategorySelectDrawerWithTrigger
                  aria-labelledby={categorySelectId}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  showTooltips={false}
                />
              )
              : (
                <BankTransactionCategoryComboBox
                  inputId={categorySelectId}
                  selectedValue={selectedCategory}
                  onSelectedValueChange={setSelectedCategory}
                  includeSuggestedMatches={false}
                  isDisabled={isMutating}
                />
              )}
          </VStack>
          {selectedCategory && isCategoryAsOption(selectedCategory) && (
            <Span>
              {mode === CategorizationMode.Categorize
                ? `This will categorize ${count} selected ${pluralize('transaction', count)} as ${selectedCategory.original.displayName}.`
                : `This will recategorize ${count} selected ${pluralize('transaction', count)} as ${selectedCategory.original.displayName}.`}
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
      useDrawer={isMobileView}
    />
  )
}
