import { HStack } from '../../ui/Stack/Stack'
import { BankTransactionsConfirmAllButton } from './BankTransactionsConfirmAllButton'
import { BankTransactionsCategorizeAllButton, CategorizationMode } from './BankTransactionsCategorizeAllButton'
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
            <BankTransactionsCategorizeAllButton mode={CategorizationMode.Categorize} />
            <BankTransactionsConfirmAllButton />
          </>
        )
        : (
          <>
            <BankTransactionsCategorizeAllButton mode={CategorizationMode.Recategorize} />
            <BankTransactionsUncategorizeAllButton />
          </>
        )}
    </HStack>
  )
}
