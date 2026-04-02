import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { GroupBase, MenuPlacement } from 'react-select'

import type { BankTransaction } from '@internal-types/bankTransactions'
import { useCategories } from '@hooks/api/businesses/[business-id]/categories/useCategories'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { HStack } from '@ui/Stack/Stack'
import { Header } from '@ui/Typography/Text'
import {
  type BankTransactionCategoryComboBoxOption,
  BankTransactionCategoryComboBoxOptionItem,
} from '@components/BankTransactionCategoryComboBox/BankTransactionCategoryComboBoxOptionItem'
import { flattenCategories, getAllCategoriesGroup, getGroupDisplayLabel, getSuggestedCategoriesGroup, getSuggestedMatchesGroup, isBoldGroupLabel, isLoadingSuggestions } from '@components/BankTransactionCategoryComboBox/utils'
import { BankTransactionsUncategorizedSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsUncategorizedSelectedValue'

import './bankTransactionCategoryComboBox.scss'

type BankTransactionCategoryComboBoxGroupHeadingProps = {
  group: GroupBase<BankTransactionCategoryComboBoxOption>
  fallback: React.ReactNode
}

const BankTransactionCategoryComboBoxGroupHeading = ({ group, fallback }: BankTransactionCategoryComboBoxGroupHeadingProps) => {
  const { t } = useTranslation()
  const displayLabel = getGroupDisplayLabel(group.label, t)
  if (displayLabel === undefined || !isBoldGroupLabel(group.label)) return fallback

  return (
    <HStack className='Layer__BankTransactionCategoryComboBox__CustomGroupHeading'>
      <Header size='xs'>{displayLabel}</Header>
    </HStack>
  )
}

type BankTransactionCategoryComboBoxProps = {
  bankTransaction?: BankTransaction
  selectedValue: BankTransactionCategoryComboBoxOption | null
  onSelectedValueChange: (value: BankTransactionCategoryComboBoxOption | null) => void
  includeSuggestedMatches?: boolean
  isDisabled?: boolean
  isLoading?: boolean
  inputId?: string
  menuPlacement?: MenuPlacement
}

export const BankTransactionCategoryComboBox = ({
  bankTransaction,
  selectedValue,
  onSelectedValueChange,
  includeSuggestedMatches = true,
  isDisabled = false,
  isLoading = false,
  inputId,
  menuPlacement = 'auto',
}: BankTransactionCategoryComboBoxProps) => {
  const { t } = useTranslation()
  const { data: categories } = useCategories()

  const matchGroup = useMemo(() => {
    if (!includeSuggestedMatches || !bankTransaction) return null
    return getSuggestedMatchesGroup(bankTransaction)
  }, [bankTransaction, includeSuggestedMatches])

  const allCategoriesGroup = useMemo(() => {
    return getAllCategoriesGroup()
  }, [])

  const suggestedGroup = useMemo(() => {
    if (!bankTransaction) return null
    return getSuggestedCategoriesGroup(bankTransaction, t)
  }, [bankTransaction, t])

  const categoryGroups = useMemo(() => {
    if (!categories) return []
    return flattenCategories(categories)
  }, [categories])

  const groups = useMemo(() => ([
    matchGroup,
    suggestedGroup,
    allCategoriesGroup,
    ...categoryGroups,
  ].filter(group => group !== null)),
  [allCategoriesGroup, categoryGroups, matchGroup, suggestedGroup])

  const numMatchOptions = matchGroup?.options.length || 0
  const loadingSuggestions = bankTransaction && isLoadingSuggestions(bankTransaction) && selectedValue === null

  const placeholder = numMatchOptions > 1
    ? `${numMatchOptions} possible matches...`
    : loadingSuggestions
      ? t('bankTransactions:label.generating_suggestions', 'Generating suggestions...')
      : includeSuggestedMatches
        ? t('bankTransactions:action.categorize_or_match', 'Categorize or match...')
        : t('bankTransactions:action.select_category', 'Select category')

  const SingleValue = useCallback(() => {
    return <BankTransactionsUncategorizedSelectedValue selectedValue={selectedValue} />
  }, [selectedValue])

  return (
    <ComboBox<BankTransactionCategoryComboBoxOption>
      className='Layer__BankTransactionCategoryComboBox'
      inputId={inputId}
      groups={groups}
      onSelectedValueChange={onSelectedValueChange}
      selectedValue={selectedValue}
      placeholder={placeholder}
      slots={{
        SingleValue,
        Option: BankTransactionCategoryComboBoxOptionItem,
        GroupHeading: BankTransactionCategoryComboBoxGroupHeading,
      }}
      isClearable={false}
      isDisabled={isDisabled}
      isLoading={isLoading || loadingSuggestions}
      menuPlacement={menuPlacement}
    />
  )
}
