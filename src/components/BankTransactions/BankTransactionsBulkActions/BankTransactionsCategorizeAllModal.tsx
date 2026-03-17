import { useCallback, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { tPlural } from '@utils/i18n/plural'
import { useBulkCategorize } from '@hooks/api/businesses/[business-id]/bank-transactions/bulk-categorize/useBulkCategorize'
import { useBulkSelectionActions, useCountSelectedIds, useSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { type BankTransactionCategoryComboBoxOption, isApiCategorizationAsOption, isCategoryAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { CategorySelectDrawerWithTrigger } from '@components/CategorySelect/CategorySelectDrawerWithTrigger'

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
  const { t } = useTranslation()
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
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={handleCategorizeModalClose}
      title={mode === CategorizationMode.Categorize ? t('bankTransactions:prompt.categorize_selected_transactions', 'Categorize all selected transactions?') : t('bankTransactions:prompt.recategorize_selected_transactions', 'Recategorize all selected transactions?')}
      content={(
        <VStack gap='xs'>
          <VStack gap='3xs'>
            <Label size='sm' htmlFor={categorySelectId}>{t('bankTransactions:action.select_category', 'Select category')}</Label>
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
                ? tPlural(t, 'bankTransactions:label.categorize_count_selected', {
                  count,
                  category: selectedCategory.original.displayName,
                  one: 'This will categorize {{count}} selected transaction as {{category}}.',
                  other: 'This will categorize {{count}} selected transactions as {{category}}.',
                })
                : tPlural(t, 'bankTransactions:label.recategorize_count_selected', {
                  count,
                  category: selectedCategory.original.displayName,
                  one: 'This will recategorize {{count}} selected transaction as {{category}}.',
                  other: 'This will recategorize {{count}} selected transactions as {{category}}.',
                })}
            </Span>
          )}
        </VStack>
      )}
      onConfirm={handleConfirm}
      confirmLabel={mode === CategorizationMode.Categorize ? t('bankTransactions:action.categorize_all', 'Categorize All') : t('bankTransactions:action.recategorize_all', 'Recategorize All')}
      confirmDisabled={!selectedCategory}
      errorText={mode === CategorizationMode.Categorize ? t('bankTransactions:error.categorize_transactions', 'Failed to categorize transactions') : t('bankTransactions:error.recategorize_transactions', 'Failed to recategorize transactions')}
      closeOnConfirm
      useDrawer={isMobileView}
    />
  )
}
