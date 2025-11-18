import { useMemo } from 'react'
import type { GroupBase } from 'react-select'

import type { BankTransaction } from '@internal-types/bank_transactions'
import { convertMatchDetailsToLinkingMetadata, decodeMatchDetails } from '@schemas/bankTransactions/match'
import { useCategories } from '@hooks/categories/useCategories'
import { useInAppLinkContext } from '@contexts/InAppLinkContext'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Header, Span } from '@ui/Typography/Text'
import { type BankTransactionCategoryComboBoxOption, isSuggestedMatchAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { BankTransactionCategoryComboBoxGroupLabel, flattenCategories, getAllCategoriesGroup, getSuggestedCategoriesGroup, getSuggestedMatchesGroup, isLoadingSuggestions } from '@components/BankTransactionCategoryComboBox/utils'
import { BankTransactionsUncategorizedSelectedValue } from '@components/BankTransactionsSelectedValue/BankTransactionsUncategorizedSelectedValue'
import { DateTime } from '@components/DateTime/DateTime'

import './bankTransactionCategoryComboBox.scss'

type BankTransactionCategoryComboBoxOptionProps = {
  option: BankTransactionCategoryComboBoxOption
  fallback: React.ReactNode
}

const BankTransactionCategoryComboBoxOption = ({ option, fallback }: BankTransactionCategoryComboBoxOptionProps) => {
  const { renderInAppLink } = useInAppLinkContext()

  if (option.value === 'LOADING_SUGGESTIONS') {
    return (
      <HStack justify='space-between' align='center' className='Layer__BankTransactionCategoryComboBox__LoadingSuggestionsOption'>
        <Span>Generating suggestions...</Span>
        <LoadingSpinner size={16} />
      </HStack>
    )
  }

  if (isSuggestedMatchAsOption(option)) {
    const matchDetails = decodeMatchDetails(option.original.details)

    const inAppLink = renderInAppLink && matchDetails
      ? renderInAppLink(convertMatchDetailsToLinkingMetadata(matchDetails))
      : null

    return (
      <VStack gap='xs' justify='start'>
        <VStack gap='3xs' justify='start'>
          <DateTime onlyDate value={option.original.details.date} slotProps={{ Date: { size: 'sm', variant: 'subtle' } }} />
          <Span size='sm' variant='placeholder'>{option.label}</Span>
          {inAppLink}
        </VStack>
        <MoneySpan size='sm' bold amount={option.original.details.amount} />
      </VStack>
    )
  }

  return fallback
}

type BankTransactionCategoryComboBoxGroupHeadingProps = {
  group: GroupBase<BankTransactionCategoryComboBoxOption>
  fallback: React.ReactNode
}

const BOLDED_LABELS: string[] = [
  BankTransactionCategoryComboBoxGroupLabel.ALL_CATEGORIES,
  BankTransactionCategoryComboBoxGroupLabel.TRANSFER,
  BankTransactionCategoryComboBoxGroupLabel.MATCH,
]

const BankTransactionCategoryComboBoxGroupHeading = ({ group, fallback }: BankTransactionCategoryComboBoxGroupHeadingProps) => {
  if (group.label !== undefined && BOLDED_LABELS.includes(group.label)) {
    return (
      <HStack className='Layer__BankTransactionCategoryComboBox__CustomGroupHeading'>
        <Header size='xs'>
          {group.label}
        </Header>
      </HStack>
    )
  }

  return fallback
}

type BankTransactionCategoryComboBoxProps = {
  bankTransaction?: BankTransaction
  selectedValue: BankTransactionCategoryComboBoxOption | null
  onSelectedValueChange: (value: BankTransactionCategoryComboBoxOption | null) => void
  includeSuggestedMatches?: boolean
  isDisabled?: boolean
  isLoading?: boolean
  inputId?: string
}

export const BankTransactionCategoryComboBox = ({
  bankTransaction,
  selectedValue,
  onSelectedValueChange,
  includeSuggestedMatches = true,
  isDisabled = false,
  isLoading = false,
  inputId,
}: BankTransactionCategoryComboBoxProps) => {
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
    return getSuggestedCategoriesGroup(bankTransaction)
  }, [bankTransaction])

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
      ? 'Generating suggestions...'
      : 'Categorize or match...'

  const SelectedValue = useMemo(() => {
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
        SelectedValue,
        Option: BankTransactionCategoryComboBoxOption,
        GroupHeading: BankTransactionCategoryComboBoxGroupHeading,
      }}
      isClearable={false}
      isDisabled={isDisabled}
      isLoading={isLoading || loadingSuggestions}
    />
  )
}
