import { useCallback, useEffect, useMemo, useState } from 'react'
import { GridList } from 'react-aria-components'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { canCategoryHaveTaxCode } from '@utils/bankTransactions/taxCode'
import { useGetBankTransactionCategorizationWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { useTaxCodeOptions } from '@hooks/features/bankTransactions/useTaxCodeOptions'
import { useBankTransactionsCategorizationActions } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { isPlaceholderAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { CategorySelectDrawer } from '@components/CategorySelect/CategorySelectDrawer'
import type { TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'
import { TaxCodeMobileDrawer } from '@components/TaxCodeSelect/TaxCodeMobileDrawer'

import './bankTransactionsMobileCategorySelection.scss'

import {
  BankTransactionsMobileCategorySelectionItem,
  type BankTransactionsMobileCategorySelectionOptionValue,
} from './BankTransactionsMobileCategorySelectionItem'
import { buildCategoryOptions, buildInitialSessionCategoriesMap } from './utils'

interface BankTransactionsMobileCategorySelectionProps {
  bankTransaction: BankTransaction
  showTooltips?: boolean
  isSubmitting?: boolean
}

export const BankTransactionsMobileCategorySelection = ({
  bankTransaction,
  showTooltips = false,
  isSubmitting = false,
}: BankTransactionsMobileCategorySelectionProps) => {
  const { t } = useTranslation()
  const { setTransactionCategorySelection, setTransactionTaxCodeSelection } = useBankTransactionsCategorizationActions()

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [sessionCategories, setSessionCategories] = useState(
    buildInitialSessionCategoriesMap(bankTransaction),
  )

  const { taxCodeOptions, hasTaxCodeOptions } = useTaxCodeOptions(bankTransaction)
  const { category: selectedCategory, taxCode: selectedTaxCode } = useGetBankTransactionCategorizationWithDefault(bankTransaction)

  useEffect(() => {
    setSessionCategories(buildInitialSessionCategoriesMap(bankTransaction))
  }, [bankTransaction])

  const categoryOptions = useMemo(
    () => buildCategoryOptions(
      sessionCategories,
      t('bankTransactions:action.show_all_categories', 'Show all categories'),
    ),
    [sessionCategories, t],
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
    setTransactionTaxCodeSelection(bankTransaction.id, taxCode)
  }, [bankTransaction.id, setTransactionTaxCodeSelection])

  return (
    <VStack gap='sm'>
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
        <TaxCodeMobileDrawer
          options={taxCodeOptions}
          selectedValue={selectedTaxCode}
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
