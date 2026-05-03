import { useTranslation } from 'react-i18next'

import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { Input } from '@components/Input/Input'

import { BankTransactionsMobileListSplitFormAddSplitButton } from './BankTransactionsMobileListSplitFormAddSplitButton'
import { useBankTransactionsMobileListSplitFormContext } from './BankTransactionsMobileListSplitFormContext'

export const BankTransactionsMobileListSplitFormTotalSummary = () => {
  const { t } = useTranslation()
  const {
    categorization: {
      addSplit,
      localSplits,
    },
    formatting: { formatCurrencyFromCents },
  } = useBankTransactionsMobileListSplitFormContext()

  return (
    <VStack pbs='xs' gap='3xs'>
      <Span size='sm'>
        {t('common:label.total', 'Total')}
      </Span>
      <HStack justify='space-between'>
        <Input
          disabled={true}
          inputMode='numeric'
          value={formatCurrencyFromCents(localSplits.reduce((total, { amount }) => total + amount, 0))}
          className='Layer__BankTransactionsMobileListSplitForm__TotalAmountInput'
        />
        <BankTransactionsMobileListSplitFormAddSplitButton onClick={addSplit} />
      </HStack>
    </VStack>
  )
}
