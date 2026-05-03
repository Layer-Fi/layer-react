import { HStack, VStack } from '@ui/Stack/Stack'
import { BankTransactionErrorText } from '@components/BankTransactions/BankTransactionErrorText'

import { BankTransactionsMobileListSplitFormAddSplitButton } from './BankTransactionsMobileListSplitFormAddSplitButton'
import { BankTransactionsMobileListSplitFormCategoryAmountRow } from './BankTransactionsMobileListSplitFormCategoryAmountRow'
import { useBankTransactionsMobileListSplitFormContext } from './BankTransactionsMobileListSplitFormContext'
import { BankTransactionsMobileListSplitFormTotalSummary } from './BankTransactionsMobileListSplitFormTotalSummary'

export const BankTransactionsMobileListSplitFormCategorizationFields = () => {
  const {
    categorization: {
      addSplit,
      localSplits,
      splitFormError,
    },
  } = useBankTransactionsMobileListSplitFormContext()

  return (
    <VStack gap='sm'>
      {localSplits.map((split, index) => (
        <BankTransactionsMobileListSplitFormCategoryAmountRow
          key={`split-${index}`}
          split={split}
          splitIndex={index}
        />
      ))}

      {localSplits.length > 1
        ? <BankTransactionsMobileListSplitFormTotalSummary />
        : (
          <HStack justify='end'>
            <BankTransactionsMobileListSplitFormAddSplitButton onClick={addSplit} />
          </HStack>
        )}

      <BankTransactionErrorText splitFormError={splitFormError} layout='inline' />
    </VStack>
  )
}
