import { useTranslation } from 'react-i18next'

import { canCategoryHaveTaxCode } from '@utils/bankTransactions/categorization'
import Trash from '@icons/Trash'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { CategorySelectDrawerWithTrigger } from '@components/CategorySelect/CategorySelectDrawerWithTrigger'
import { AmountInput } from '@components/Input/AmountInput'

import {
  type BankTransactionsMobileListSplitFormLocalSplit,
  useBankTransactionsMobileListSplitFormContext,
} from './BankTransactionsMobileListSplitFormContext'
import { BankTransactionsMobileListSplitFormTaxCodeField } from './BankTransactionsMobileListSplitFormTaxCodeField'

interface BankTransactionsMobileListSplitFormCategoryAmountRowProps {
  split: BankTransactionsMobileListSplitFormLocalSplit
  splitIndex: number
}

export const BankTransactionsMobileListSplitFormCategoryAmountRow = ({
  split,
  splitIndex,
}: BankTransactionsMobileListSplitFormCategoryAmountRowProps) => {
  const { t } = useTranslation()
  const {
    transaction: {
      showCategorization,
      showTooltips,
    },
    categorization: {
      localSplits,
      removeSplit,
      updateSplitAmount,
      handleCategoryChange,
      getInputValueForSplitAtIndex,
      onBlurSplitAmount,
    },
    taxCodes: { hasTaxCodeOptions },
  } = useBankTransactionsMobileListSplitFormContext()

  return (
    <VStack
      gap='3xs'
      pbs='sm'
    >
      {splitIndex === 0 && localSplits.length > 1 && (
        <Span size='sm'>
          {t('bankTransactions:label.split_label', 'Splits')}
        </Span>
      )}
      <VStack gap='xs'>
        <VStack className='Layer__BankTransactionsMobileListSplitForm__SplitGridContainer'>
          <AmountInput
            name={`split-${splitIndex}`}
            disabled={splitIndex === 0 || !showCategorization}
            onChange={updateSplitAmount(splitIndex)}
            value={getInputValueForSplitAtIndex(splitIndex, split)}
            onBlur={onBlurSplitAmount}
            isInvalid={split.amount < 0}
            className='Layer__BankTransactionsMobileListSplitForm__AmountInput'
          />

          <HStack
            align='center'
            gap='xs'
            fluid
          >
            <CategorySelectDrawerWithTrigger
              value={split.category}
              onChange={handleCategoryChange(splitIndex)}
              showTooltips={showTooltips}
            />
            {splitIndex > 0 && (
              <Button
                onClick={() => removeSplit(splitIndex)}
                variant='outlined'
                icon
                inset
                aria-label={t('common:action.remove', 'Remove')}
              >
                <Trash size={14} />
              </Button>
            )}
          </HStack>

          {hasTaxCodeOptions && canCategoryHaveTaxCode(split.category) && (
            <BankTransactionsMobileListSplitFormTaxCodeField
              split={split}
              splitIndex={splitIndex}
            />
          )}
        </VStack>
      </VStack>
    </VStack>
  )
}
