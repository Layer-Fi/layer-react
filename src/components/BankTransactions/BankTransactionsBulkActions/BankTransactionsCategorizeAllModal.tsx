import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { type Classification } from '@schemas/categorization'
import { tPlural } from '@utils/i18n/plural'
import { useBulkCategorize } from '@hooks/api/businesses/[business-id]/bank-transactions/bulk-categorize/useBulkCategorize'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useBulkSelectionActions, useCountSelectedIds, useSelectedIds } from '@providers/BulkSelectionStore/BulkSelectionStoreProvider'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { BaseConfirmationModal } from '@blocks/BaseConfirmationModal/BaseConfirmationModal'
import { BankTransactionCategoryComboBox } from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBox'
import { type BankTransactionCategoryComboBoxOption, isApiCategorizationAsOption, isCategoryAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { CategorySelectDrawerWithTrigger } from '@components/CategorySelect/CategorySelectDrawerWithTrigger'
import { type TaxCodeSelectOption } from '@components/TaxCodeSelect/TaxCodeSelectDrawer'
import { TaxCodeSelectDrawerWithTrigger } from '@components/TaxCodeSelect/TaxCodeSelectDrawerWithTrigger'

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

const NO_TAX_CODE_COMBO_VALUE = '__no_tax_code__'

const getTaxCodeOptions = (bankTransaction: BankTransaction): TaxCodeSelectOption[] => {
  return bankTransaction.tax_options?.canada.map(taxOption => ({
    label: taxOption.display_name,
    value: taxOption.code,
  })) ?? []
}

const resolveBulkTaxCode = (
  bankTransaction: BankTransaction | undefined,
  classification: Classification,
  selectedTaxCode: string | null | undefined,
): string | null => {
  if (classification.type === 'Exclusion') {
    return null
  }

  if (selectedTaxCode === undefined) {
    return bankTransaction?.tax_code ?? null
  }

  if (selectedTaxCode === null) {
    return null
  }

  return bankTransaction?.tax_options?.canada.some(taxOption => taxOption.code === selectedTaxCode)
    ? selectedTaxCode
    : null
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
  const [selectedCategory, setSelectedCategory] = useState<BankTransactionCategoryComboBoxOption | null>(null)
  const [selectedTaxCode, setSelectedTaxCode] = useState<TaxCodeSelectOption | null>(null)
  const { trigger, isMutating } = useBulkCategorize()

  const bankTransactionsById = useMemo(
    () => new Map((bankTransactions ?? []).map(bankTransaction => [bankTransaction.id, bankTransaction])),
    [bankTransactions],
  )

  const selectedTransactions = useMemo(() => {
    return Array.from(selectedIds)
      .map(transactionId => bankTransactionsById.get(transactionId))
      .filter((bankTransaction): bankTransaction is BankTransaction => bankTransaction !== undefined)
  }, [bankTransactionsById, selectedIds])

  const taxCodeOptions = useMemo(() => {
    const taxCodesByValue = new Map<string, TaxCodeSelectOption>()

    selectedTransactions.forEach((bankTransaction) => {
      getTaxCodeOptions(bankTransaction).forEach((option) => {
        if (!taxCodesByValue.has(option.value)) {
          taxCodesByValue.set(option.value, option)
        }
      })
    })

    return Array.from(taxCodesByValue.values())
  }, [selectedTransactions])

  const taxCodeComboBoxOptions = useMemo((): TaxCodeSelectOption[] => {
    return [
      {
        label: t('bankTransactions:action.no_tax_code', 'No tax code'),
        value: NO_TAX_CODE_COMBO_VALUE,
      },
      ...taxCodeOptions,
    ]
  }, [t, taxCodeOptions])

  useEffect(() => {
    if (!selectedTaxCode) {
      return
    }
    if (selectedTaxCode.value === NO_TAX_CODE_COMBO_VALUE) {
      return
    }
    if (!taxCodeOptions.some(option => option.value === selectedTaxCode.value)) {
      setSelectedTaxCode(null)
    }
  }, [selectedTaxCode, taxCodeOptions])

  const handleCategorizeModalClose = useCallback((isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setSelectedCategory(null)
      setSelectedTaxCode(null)
    }
  }, [onOpenChange])

  const handleCategoryChange = useCallback((nextCategory: BankTransactionCategoryComboBoxOption | null) => {
    setSelectedCategory(nextCategory)

    if (nextCategory?.classification?.type === 'Exclusion') {
      setSelectedTaxCode(null)
    }
  }, [])

  const handleTaxCodeChange = useCallback((next: TaxCodeSelectOption | null) => {
    if (next === null) {
      setSelectedTaxCode({
        label: t('bankTransactions:action.no_tax_code', 'No tax code'),
        value: NO_TAX_CODE_COMBO_VALUE,
      })
      return
    }
    setSelectedTaxCode(next)
  }, [t])

  const handleConfirm = useCallback(async () => {
    if (!selectedCategory || selectedCategory.classification === null) {
      return
    }

    if (!isCategoryAsOption(selectedCategory) && !isApiCategorizationAsOption(selectedCategory)) {
      return
    }

    const classification = selectedCategory.classification
    const selectedTaxCodeValue = selectedTaxCode === null
      ? undefined
      : selectedTaxCode.value === NO_TAX_CODE_COMBO_VALUE
        ? null
        : selectedTaxCode.value
    const categorization = {
      type: 'Category' as const,
      category: classification,
    }

    await trigger({
      transactions: Array.from(selectedIds).map(transactionId => ({
        transactionId,
        categorization: {
          ...categorization,
          taxCode: resolveBulkTaxCode(
            bankTransactionsById.get(transactionId),
            classification,
            selectedTaxCodeValue,
          ),
        },
      })),
    })

    clearSelection()
  }, [selectedIds, selectedCategory, selectedTaxCode, trigger, clearSelection, bankTransactionsById])

  const categorySelectId = useId()
  const taxCodeSelectId = useId()
  const showTaxCodeSelector = taxCodeOptions.length > 0
  const isTaxCodeDisabled = isMutating || selectedCategory?.classification?.type === 'Exclusion'

  return (
    <BaseConfirmationModal
      isOpen={isOpen}
      onOpenChange={handleCategorizeModalClose}
      title={mode === CategorizationMode.Categorize ? t('bankTransactions:prompt.categorize_selected_transactions', 'Categorize all selected transactions?') : t('bankTransactions:prompt.recategorize_selected_transactions', 'Recategorize all selected transactions?')}
      content={(
        <VStack gap='xs'>
          <VStack gap='3xs'>
            <Label size='sm' htmlFor={categorySelectId}>{t('bankTransactions:label.category', 'Category')}</Label>
            {isMobileView
              ? (
                <CategorySelectDrawerWithTrigger
                  aria-labelledby={categorySelectId}
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  showTooltips={false}
                />
              )
              : (
                <BankTransactionCategoryComboBox
                  inputId={categorySelectId}
                  selectedValue={selectedCategory}
                  onSelectedValueChange={handleCategoryChange}
                  includeSuggestedMatches={false}
                  isDisabled={isMutating}
                />
              )}
          </VStack>
          {showTaxCodeSelector && (
            <VStack gap='3xs' pbs='sm'>
              <Label size='sm' htmlFor={taxCodeSelectId}>{t('bankTransactions:label.tax_code', 'Tax Code')}</Label>
              {isMobileView
                ? (
                  <TaxCodeSelectDrawerWithTrigger
                    options={taxCodeOptions}
                    value={selectedTaxCode === null ? undefined : selectedTaxCode}
                    onChange={handleTaxCodeChange}
                    isDisabled={isTaxCodeDisabled}
                    placeholder={t('bankTransactions:action.select_tax_code', 'Select tax code')}
                  />
                )
                : (
                  <ComboBox<TaxCodeSelectOption>
                    inputId={taxCodeSelectId}
                    selectedValue={selectedTaxCode}
                    onSelectedValueChange={handleTaxCodeChange}
                    options={taxCodeComboBoxOptions}
                    isDisabled={isTaxCodeDisabled}
                    isSearchable={false}
                    isClearable
                    placeholder={t('bankTransactions:action.select_tax_code', 'Select tax code')}
                  />
                )}
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
