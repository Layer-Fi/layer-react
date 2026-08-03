import { ChevronRight, SparklesIcon } from 'lucide-react'
import { GridListItem } from 'react-aria-components/GridList'

import type { BankTransactionNonSuggestedMatchOption } from '@providers/categorization/BankTransactionsCategorizationStore/utils'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

import './bankTransactionsMobileCategorySelectionItem.scss'

export type BankTransactionsMobileCategorySelectionOptionValue = BankTransactionNonSuggestedMatchOption

export interface BankTransactionsMobileCategorySelectionItemOption {
  value: BankTransactionsMobileCategorySelectionOptionValue
  asLink?: boolean
  isSuggested?: boolean
}

interface BankTransactionsMobileCategorySelectionItemProps {
  option: BankTransactionsMobileCategorySelectionItemOption
}

export const BankTransactionsMobileCategorySelectionItem = ({
  option,
}: BankTransactionsMobileCategorySelectionItemProps) => {
  const value = option.value.value
  const label = option.value.label

  return (
    <GridListItem
      id={value}
      key={value}
      textValue={label}
      className='Layer__BankTransactionsMobileCategorySelectionItem'
    >
      <HStack gap='md' pi='md' pb='sm'>
        {!option.asLink && (
          <Checkbox
            slot='selection'
            variant='round'
          />
        )}

        <HStack gap='xs' align='center'>
          {option.isSuggested && (
            <SparklesIcon
              size={14}
              className='Layer__BankTransactionsMobileCategorySelectionItem__sparkle-icon'
            />
          )}
          <Span size='sm'>{label}</Span>
        </HStack>

        {option.asLink && (
          <ChevronRight
            size={16}
            className='Layer__BankTransactionsMobileCategorySelectionItem__link-icon'
          />
        )}
      </HStack>
    </GridListItem>
  )
}
