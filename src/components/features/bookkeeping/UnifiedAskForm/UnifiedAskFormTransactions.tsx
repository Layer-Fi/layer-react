import { type AskFormTransaction } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { HStack, VStack } from '@ui/Stack/Stack'
import { UnifiedAskFormTransactionCells } from '@features/bookkeeping/UnifiedAskForm/UnifiedAskFormTransactionCells'

export const UnifiedAskFormTransactions = ({ transactions }: { transactions: ReadonlyArray<AskFormTransaction> }) => (
  <VStack className='Layer__UnifiedAskForm__Rows' {...toDataProperties({ variant: 'table' })}>
    {transactions.map(transaction => (
      <VStack key={transaction.id} className='Layer__UnifiedAskForm__Row' pi='md'>
        <HStack className='Layer__UnifiedAskForm__RowSummary' align='center' gap='xs' overflow='hidden' fluid>
          <UnifiedAskFormTransactionCells transaction={transaction} />
        </HStack>
      </VStack>
    ))}
  </VStack>
)
