import { HStack } from '../../ui/Stack/Stack'
import './BankTransactionsBulkActions.scss'
import { BankTransactionsConfirmAllButton } from './BankTransactionsConfirmAllButton'
import { BankTransactionsCategorizeAllButton } from './BankTransactionsCategorizeAllButton'

export const BankTransactionsBulkActions = () => {
  return (
    <HStack pis='3xl' align='center' gap='xs'>
      <BankTransactionsConfirmAllButton />
      <BankTransactionsCategorizeAllButton />
    </HStack>
  )
}
