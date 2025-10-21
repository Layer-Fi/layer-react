import { HStack } from '../../ui/Stack/Stack'
import { BankTransactionsConfirmAllButton } from './BankTransactionsConfirmAllButton'
import { BankTransactionsCategorizeAllButton } from './BankTransactionsCategorizeAllButton'

export const BankTransactionsBulkActions = () => {
  return (
    <HStack pis='3xl' align='center' gap='sm'>
      <BankTransactionsCategorizeAllButton />
      <BankTransactionsConfirmAllButton />
    </HStack>
  )
}
