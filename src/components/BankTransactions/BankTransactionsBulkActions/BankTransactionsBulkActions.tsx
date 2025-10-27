import { HStack } from '../../ui/Stack/Stack'
import { BankTransactionsConfirmAllButton } from './BankTransactionsConfirmAllButton'
import { BankTransactionsCategorizeAllButton } from './BankTransactionsCategorizeAllButton'
import { BankTransactionsUncategorizeAllButton } from './BankTransactionsUncategorizeAllButton'
import { useBankTransactionsContext } from '../../../contexts/BankTransactionsContext'
import { DisplayState } from '../../../types/bank_transactions'

export const BankTransactionsBulkActions = () => {
  const { display } = useBankTransactionsContext()

  return (
    <HStack pis='3xl' align='center' gap='sm'>
      {display === DisplayState.review
        ? (
          <>
            <BankTransactionsCategorizeAllButton mode='categorize' />
            <BankTransactionsConfirmAllButton />
          </>
        )
        : (
          <>
            <BankTransactionsCategorizeAllButton mode='recategorize' />
            <BankTransactionsUncategorizeAllButton />
          </>
        )}
    </HStack>
  )
}
