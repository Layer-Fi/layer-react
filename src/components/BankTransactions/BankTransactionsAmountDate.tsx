import { HStack, VStack } from '@components/ui/Stack/Stack'
import { MoneySpan } from '@components/ui/Typography/MoneySpan'
import { Span } from '@components/ui/Typography/Text'
import { BankTransaction } from '@internal-types/bank_transactions'
import { isCredit } from '@utils/bankTransactions'
import { DateTime } from '@components/DateTime/DateTime'

const DATE_FORMAT = 'LLL d'

interface BankTransactionsAmountDateProps {
  bankTransaction: BankTransaction
  slotProps?: {
    amount?: { size: 'sm' | 'md' }
    date?: { size: 'xs' | 'sm' }
  }
}

export const BankTransactionsAmountDate = ({ bankTransaction, slotProps }: BankTransactionsAmountDateProps) => {
  return (
    <VStack
      align='end'
      gap='3xs'
      pb='sm'
    >
      <HStack>
        <Span {...slotProps?.amount}>
          {isCredit(bankTransaction) ? '+' : ''}
        </Span>
        <MoneySpan
          amount={bankTransaction.amount}
          size={slotProps?.amount?.size}
        />
      </HStack>

      <DateTime
        value={bankTransaction.date}
        dateFormat={DATE_FORMAT}
        onlyDate
        slotProps={{
          Date: { size: slotProps?.date?.size ?? 'sm', variant: 'subtle' },
        }}
      />
    </VStack>
  )
}
