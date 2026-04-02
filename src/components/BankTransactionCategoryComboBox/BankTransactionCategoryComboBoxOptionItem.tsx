import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { type ApiCategorizationAsOption, CategorizationOption, type CategoryAsOption, type PlaceholderAsOption, type SplitAsOption, type SuggestedMatchAsOption } from '@internal-types/categorizationOption'
import { convertMatchDetailsToLinkingMetadata, decodeMatchDetails } from '@schemas/bankTransactions/match'
import { useInAppLinkContext } from '@contexts/InAppLinkContext'
import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'
import { HStack, VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { DateTime } from '@components/DateTime/DateTime'

export const BankTransactionCategoryComboBoxOptionItem = ({ option, fallback }: BankTransactionCategoryComboBoxOptionProps) => {
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
        <MoneySpan size='sm' weight='bold' amount={option.original.details.amount} />
      </VStack>
    )
  }

  return fallback
}

export type BankTransactionCategoryComboBoxOption =
  CategoryAsOption |
  SuggestedMatchAsOption |
  SplitAsOption |
  PlaceholderAsOption |
  ApiCategorizationAsOption

export const isCategoryAsOption = (option: BankTransactionCategoryComboBoxOption): option is CategoryAsOption => {
  return option.type === CategorizationOption.Category
}

export const isSuggestedMatchAsOption = (option: BankTransactionCategoryComboBoxOption): option is SuggestedMatchAsOption => {
  return option.type === CategorizationOption.SuggestedMatch
}

export const isSplitAsOption = (option: BankTransactionCategoryComboBoxOption): option is SplitAsOption => {
  return option.type === CategorizationOption.Split
}

export const isApiCategorizationAsOption = (option: BankTransactionCategoryComboBoxOption): option is ApiCategorizationAsOption => {
  return option.type === CategorizationOption.ApiCategorization
}

export const isPlaceholderAsOption = (option: BankTransactionCategoryComboBoxOption): option is PlaceholderAsOption => {
  return option.type === CategorizationOption.Placeholder
}

export type BankTransactionCategoryComboBoxOptionProps = {
  option: BankTransactionCategoryComboBoxOption
  fallback: ReactNode
}
