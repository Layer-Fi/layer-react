import { useTranslation } from 'react-i18next'

import Scissors from '@icons/Scissors'
import { Button } from '@ui/Button/Button'
import { HStack } from '@ui/Stack/Stack'

interface BankTransactionsMobileListSplitFormAddSplitButtonProps {
  onClick: () => void
}

export const BankTransactionsMobileListSplitFormAddSplitButton = ({ onClick }: BankTransactionsMobileListSplitFormAddSplitButtonProps) => {
  const { t } = useTranslation()

  return (
    <Button
      onClick={onClick}
      variant='outlined'
    >
      <HStack align='center' gap='2xs' pis='2xs' pie='2xs'>
        {t('bankTransactions:action.split_label', 'Split')}
        <Scissors size={14} />
      </HStack>
    </Button>
  )
}
