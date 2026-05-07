import { useCallback, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { canCategoryHaveTaxCode, resolveCategoryTaxCode } from '@utils/bankTransactions/taxCode'
import { tPlural } from '@utils/i18n/plural'
import { useBulkCategorize } from '@hooks/api/businesses/[business-id]/bank-transactions/bulk-categorize/useBulkCategorize'
import { useTaxCodeOptions } from '@hooks/features/bankTransactions/useTaxCodeOptions'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'
import { useBulkSelectionActions, useCountSelectedIds, useSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { isApiCategorizationAsOption, isCategoryAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { getBankTransactionsById, getFirstBankTransactionWithTaxOptions, getSelectedBankTransactions } from '@components/BankTransactions/BankTransactionsBulkActions/utils'
import { CategorySelectDrawerWithTrigger } from '@components/CategorySelect/CategorySelectDrawerWithTrigger'
import type { TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'
import { TaxCodeSelect } from '@components/TaxCodeSelect/TaxCodeSelect'

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
  const { formatNumber } = useIntlFormatter()
  const { count } = useCountSelectedIds()
  const { selectedIds } = useSelectedIds()
  const { clearSelection } = useBulkSelectionActions()
  const { data: bankTransactions } = useBankTransactionsContext()

  const [selectedCategory, setSelectedCategory] = useState<BankTransactionNonSuggestedMatchOption | null>(null)

  const [selectedTaxCode, setSelectedTaxCode] = useState<TaxCodeComboBoxOption | null>(null)
  const { trigger, isMutating } = useBulkCategorize()

  const bankTransactionsById = useMemo(
    () => getBankTransactionsById(bankTransactions),
    [bankTransactions],
  )

  const selectedTransactions = useMemo(
    () => getSelectedBankTransactions(selectedIds, bankTransactionsById),
    [selectedIds, bankTransactionsById],
  )

  const firstSelectedBankTransactionWithTaxOptions = useMemo(
    () => getFirstBankTransactionWithTaxOptions(selectedTransactions),
    [selectedTransactions],
  )

  const { taxCodeOptions } = useTaxCodeOptions(firstSelectedBankTransactionWithTaxOptions)

  const handleCategorizeModalClose = useCallback((isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setSelectedCategory(null)
      setSelectedTaxCode(null)
    }
  }, [onOpenChange])

  const handleConfirm = useCallback(async () => {
    if (!selectedCategory || selectedCategory.classification === null) {
      return
    }

    if (!isCategoryAsOption(selectedCategory) && !isApiCategorizationAsOption(selectedCategory)) {
      return
    }

    const categorization = {
      type: 'Category' as const,
      category: selectedCategory.classification,
    }

    await trigger({
      transactions: Array.from(selectedIds).map(transactionId => ({
        transactionId,
        categorization: {
          ...categorization,
          taxCode: resolveCategoryTaxCode(
            bankTransactionsById.get(transactionId),
            selectedCategory,
            selectedTaxCode,
          ),
        },
      })),
    })

    clearSelection()
  }, [selectedIds, selectedCategory, selectedTaxCode, trigger, clearSelection, bankTransactionsById])

  const categorySelectId = useId()
  const taxCodeSelectId = useId()
  const showTaxCodeSelect = taxCodeOptions.length > 0 && canCategoryHaveTaxCode(selectedCategory)

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
          {showTaxCodeSelect && (
            <VStack gap='3xs' pbs='sm'>
              <Label size='sm' htmlFor={taxCodeSelectId}>{t('bankTransactions:label.tax_code', 'Tax Code')}</Label>
              <TaxCodeSelect
                inputId={taxCodeSelectId}
                isMobile={isMobileView}
                options={taxCodeOptions}
                selectedValue={selectedTaxCode}
                onSelectedValueChange={setSelectedTaxCode}
                isDisabled={isMutating}
              />
            </VStack>
          )}
          {selectedCategory && isCategoryAsOption(selectedCategory) && (
            <Span>
              {mode === CategorizationMode.Categorize
                ? tPlural(t, 'bankTransactions:label.categorize_count_selected', {
                  count,
                  displayCount: formatNumber(count),
                  category: selectedCategory.original.displayName,
                  one: 'This will categorize {{displayCount}} selected transaction as {{category}}.',
                  other: 'This will categorize {{displayCount}} selected transactions as {{category}}.',
                })
                : tPlural(t, 'bankTransactions:label.recategorize_count_selected', {
                  count,
                  displayCount: formatNumber(count),
                  category: selectedCategory.original.displayName,
                  one: 'This will recategorize {{displayCount}} selected transaction as {{category}}.',
                  other: 'This will recategorize {{displayCount}} selected transactions as {{category}}.',
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
