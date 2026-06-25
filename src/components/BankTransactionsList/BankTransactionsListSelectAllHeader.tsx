import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { useBankTransactionsTableCheckboxState } from '@hooks/features/bankTransactions/useBankTransactionsTableCheckboxState'
import { Checkbox } from '@ui/Checkbox/Checkbox'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'

type BankTransactionsListSelectAllHeaderProps = {
  bankTransactions?: BankTransaction[]
}

export const BankTransactionsListSelectAllHeader = ({
  bankTransactions,
}: BankTransactionsListSelectAllHeaderProps) => {
  const { t } = useTranslation()
  const { isAllSelected, isPartiallySelected, onHeaderCheckboxChange } = useBankTransactionsTableCheckboxState({ bankTransactions })

  return (
    <HStack gap='md' pi='md' pb='md' align='center'>
      <Checkbox
        isSelected={isAllSelected}
        isIndeterminate={isPartiallySelected}
        onChange={onHeaderCheckboxChange}
        aria-label={t('bankTransactions:label.select_all_transactions', 'Select all transactions on this page')}
      />
      <Span size='sm'>
        {t('common:label.select_all', 'Select all')}
      </Span>
    </HStack>
  )
}
