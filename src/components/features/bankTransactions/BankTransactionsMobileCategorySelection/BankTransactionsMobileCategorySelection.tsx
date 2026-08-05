import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GridList } from 'react-aria-components/GridList'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/features/bankTransactions/bankTransaction'
import { isPlaceholderAsOption } from '@internal-types/features/categorization/bankTransactionCategoryComboBoxOption'
import { canCategoryHaveTaxCode } from '@utils/features/bankTransactions/taxCode'
import type { TaxCodeComboBoxOption } from '@utils/features/bankTransactions/taxCodeComboBoxOption'
import { BankTransactionsFeature, useIsBankTransactionsFeatureEnabled } from '@providers/features/bankTransactions/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'
import { useBankTransactionsCategorizationActions } from '@providers/features/categorization/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { useGetBankTransactionCategorizationWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { useTaxCodeOptions } from '@hooks/features/bankTransactions/useTaxCodeOptions'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { BankTransactionTaxCodeDrawer } from '@features/bankTransactions/BankTransactionTaxCodeSelect/BankTransactionTaxCodeDrawer'
import { CategorySelectDrawer } from '@features/categorization/CategorySelectDrawer/CategorySelectDrawer'

import './bankTransactionsMobileCategorySelection.scss'

import {
  BankTransactionsMobileCategorySelectionItem,
  type BankTransactionsMobileCategorySelectionOptionValue,
} from './BankTransactionsMobileCategorySelectionItem'
import { buildCategoryOptions, buildInitialSessionCategoriesMap, getSuggestedCategoryValues } from './utils'

interface BankTransactionsMobileCategorySelectionProps {
  bankTransaction: BankTransaction
  isSubmitting?: boolean
}

export const BankTransactionsMobileCategorySelection = ({
  bankTransaction,
  isSubmitting = false,
}: BankTransactionsMobileCategorySelectionProps) => {
  const { t } = useTranslation()
  const showTooltips = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.Tooltips)
  const { setTransactionCategorySelection, setTransactionTaxCodeSelection } = useBankTransactionsCategorizationActions()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const previousTransactionIdRef = useRef(bankTransaction.id)

  const { taxCodeOptions, hasTaxCodeOptions, getSelectedTaxCodeOption } = useTaxCodeOptions(bankTransaction)
  const { category: selectedCategory, taxCode: selectedTaxCode } = useGetBankTransactionCategorizationWithDefault(bankTransaction)

  const [sessionCategories, setSessionCategories] = useState(
    () => buildInitialSessionCategoriesMap(bankTransaction, selectedCategory),
  )

  useEffect(() => {
    if (previousTransactionIdRef.current === bankTransaction.id) return

    setSessionCategories(buildInitialSessionCategoriesMap(bankTransaction, selectedCategory))

    previousTransactionIdRef.current = bankTransaction.id
  }, [bankTransaction, selectedCategory])

  const categoryOptions = useMemo(
    () => buildCategoryOptions(
      sessionCategories,
      t('bankTransactions:action.show_all_categories', 'Show all categories'),
      getSuggestedCategoryValues(bankTransaction),
    ),
    [bankTransaction, sessionCategories, t],
  )

  const handleCategoryGridSelect = useCallback((selectionKeys: Set<string | number> | 'all') => {
    if (selectionKeys === 'all') return

    const selectedKey = [...selectionKeys][0]
    const selectedCategoryItem = categoryOptions.find(categoryItem => categoryItem.value.value === selectedKey)
    if (!selectedCategoryItem) return

    if (selectedCategoryItem.asLink) {
      setIsDrawerOpen(true)
      return
    }

    const selectedCategoryOption = selectedCategoryItem.value
    if (!isPlaceholderAsOption(selectedCategoryOption)) {
      setSessionCategories(previousCategories => new Map(previousCategories).set(selectedCategoryOption.value, selectedCategoryOption))
    }

    if (selectedCategory && selectedCategory.value === selectedCategoryOption.value) {
      setTransactionCategorySelection(bankTransaction.id, null)
      return
    }

    setTransactionCategorySelection(bankTransaction.id, selectedCategoryOption)
  }, [bankTransaction.id, categoryOptions, selectedCategory, setTransactionCategorySelection])

  const handleCategoryDrawerSelect = useCallback((selectedDrawerCategory: BankTransactionsMobileCategorySelectionOptionValue | null) => {
    if (!selectedDrawerCategory) return

    setSessionCategories(previousCategories => new Map(previousCategories).set(selectedDrawerCategory.value, selectedDrawerCategory))
    setTransactionCategorySelection(bankTransaction.id, selectedDrawerCategory)
  }, [bankTransaction.id, setTransactionCategorySelection])

  const handleTaxCodeSelect = useCallback((taxCode: TaxCodeComboBoxOption | null) => {
    setTransactionTaxCodeSelection(bankTransaction.id, taxCode?.value ?? null)
  }, [bankTransaction.id, setTransactionTaxCodeSelection])

  return (
    <VStack gap='3xs'>
      <Span size='sm' weight='bold'>
        {t('bankTransactions:action.select_category', 'Select category')}
      </Span>
      <GridList
        aria-label={t('bankTransactions:action.select_a_category', 'Select a category')}
        selectionMode='single'
        selectedKeys={selectedCategory?.value ? new Set([selectedCategory.value]) : new Set()}
        onSelectionChange={handleCategoryGridSelect}
        className='Layer__BankTransactionsMobileCategorySelection'
      >
        {categoryOptions.map(categoryItem => (
          <BankTransactionsMobileCategorySelectionItem key={categoryItem.value.value} option={categoryItem} />
        ))}
      </GridList>
      {hasTaxCodeOptions && canCategoryHaveTaxCode(selectedCategory) && (
        <BankTransactionTaxCodeDrawer
          options={taxCodeOptions}
          selectedValue={getSelectedTaxCodeOption(selectedTaxCode)}
          onSelectedValueChange={handleTaxCodeSelect}
          isDisabled={isSubmitting}
        />
      )}
      <CategorySelectDrawer
        onSelectedValueChange={handleCategoryDrawerSelect}
        selectedValue={selectedCategory}
        showTooltips={showTooltips}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </VStack>
  )
}
