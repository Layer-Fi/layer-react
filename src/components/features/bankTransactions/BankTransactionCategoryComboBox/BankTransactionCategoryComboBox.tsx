import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { GroupBase } from 'react-select'

import { type BankTransactionCategoryComboBoxOption, isSuggestedMatchAsOption } from '@internal-types/bankTransactionCategoryComboBoxOption'
import type { BankTransaction } from '@internal-types/bankTransactions'
import { convertMatchDetailsToLinkingMetadata } from '@utils/bankTransactions/matchLinkingMetadata'
import { flattenCategories } from '@utils/categoryOptions'
import { useGetCategories } from '@api/businesses/[business-id]/categories/get'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/categorization/BankTransactionsCategorizationStore/utils'
import { useInAppLinkContext } from '@providers/common/InAppLink/InAppLinkContext'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { DateTime } from '@ui/DateTime/DateTime'
import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Header, Span } from '@ui/Typography/Text'
import { getAllCategoriesGroup, getGroupDisplayLabel, getSuggestedCategoriesGroup, getSuggestedMatchesGroup, isBoldGroupLabel, isLoadingSuggestions } from '@features/bankTransactions/BankTransactionCategoryComboBox/utils'
import { BankTransactionsUncategorizedSelectedValue } from '@features/bankTransactions/BankTransactionsSelectedValue/BankTransactionsUncategorizedSelectedValue'

import './bankTransactionCategoryComboBox.scss'

type BankTransactionCategoryComboBoxOptionProps = {
  option: BankTransactionCategoryComboBoxOption
  fallback: React.ReactNode
}

const BankTransactionCategoryComboBoxOption = ({ option, fallback }: BankTransactionCategoryComboBoxOptionProps) => {
  const { t } = useTranslation()
  const { renderInAppLink } = useInAppLinkContext()

  if (option.value === 'LOADING_SUGGESTIONS') {
    return (
      <HStack justify='space-between' align='center' className='Layer__BankTransactionCategoryComboBox__LoadingSuggestionsOption'>
        <Span>{t('bankTransactions:label.generating_suggestions', 'Generating suggestions...')}</Span>
        <LoadingSpinner size={16} />
      </HStack>
    )
  }

  if (isSuggestedMatchAsOption(option)) {
    const matchDetails = option.original.details

    const inAppLink = renderInAppLink && matchDetails
      ? renderInAppLink(convertMatchDetailsToLinkingMetadata(matchDetails))
      : null

    return (
      <VStack gap='xs' justify='start'>
        <VStack gap='3xs' justify='start'>
          <DateTime onlyDate valueAsDate={option.original.details.date} slotProps={{ Date: { size: 'sm', variant: 'subtle' } }} />
          <Span size='sm' variant='placeholder'>{option.label}</Span>
          {inAppLink}
        </VStack>
        <MoneySpan size='sm' weight='bold' amount={option.original.details.amount} />
      </VStack>
    )
  }

  return fallback
}

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

type BankTransactionCategoryComboBoxBaseProps = {
  bankTransaction?: BankTransaction
  isDisabled?: boolean
  isLoading?: boolean
  inputId?: string
  showAiSparkle?: boolean
}

type BankTransactionCategoryComboBoxWithMatchesProps = {
  selectedValue: BankTransactionCategoryComboBoxOption | null
  onSelectedValueChange: (value: BankTransactionCategoryComboBoxOption | null) => void
  includeSuggestedMatches?: true
}

type BankTransactionCategoryComboBoxWithoutMatchesProps = {
  selectedValue: BankTransactionNonSuggestedMatchOption | null
  onSelectedValueChange: (value: BankTransactionNonSuggestedMatchOption | null) => void
  includeSuggestedMatches: false
}

type BankTransactionCategoryComboBoxProps = BankTransactionCategoryComboBoxBaseProps
  & (BankTransactionCategoryComboBoxWithMatchesProps | BankTransactionCategoryComboBoxWithoutMatchesProps)

export const BankTransactionCategoryComboBox = ({
  bankTransaction,
  selectedValue,
  onSelectedValueChange,
  includeSuggestedMatches = true,
  isDisabled = false,
  isLoading = false,
  inputId,
  showAiSparkle = true,
}: BankTransactionCategoryComboBoxProps) => {
  const { t } = useTranslation()
  const { data: categories } = useGetCategories()

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

  const isSuggestedCategorySelected = selectedValue !== null
    && (suggestedGroup?.options.some(option => option.value === selectedValue.value) ?? false)

  const SingleValue = useCallback(() => {
    return (
      <BankTransactionsUncategorizedSelectedValue
        selectedValue={selectedValue}
        showAiSparkle={showAiSparkle && isSuggestedCategorySelected}
      />
    )
  }, [isSuggestedCategorySelected, selectedValue, showAiSparkle])

  const handleSelectedValueChange = useCallback((value: BankTransactionCategoryComboBoxOption | null) => {
    if (!includeSuggestedMatches) {
      if (value !== null && isSuggestedMatchAsOption(value)) return
      onSelectedValueChange(value)
      return
    }

    const onSelectedValueChangeWithMatches = onSelectedValueChange as (nextValue: BankTransactionCategoryComboBoxOption | null) => void
    onSelectedValueChangeWithMatches(value)
  }, [includeSuggestedMatches, onSelectedValueChange])

  return (
    <ComboBox<BankTransactionCategoryComboBoxOption>
      className='Layer__BankTransactionCategoryComboBox'
      inputId={inputId}
      groups={groups}
      onSelectedValueChange={handleSelectedValueChange}
      selectedValue={selectedValue}
      placeholder={placeholder}
      slots={{
        SingleValue,
        Option: BankTransactionCategoryComboBoxOption,
        GroupHeading: BankTransactionCategoryComboBoxGroupHeading,
      }}
      isClearable={false}
      isDisabled={isDisabled}
      isLoading={isLoading || loadingSuggestions}
    />
  )
}
