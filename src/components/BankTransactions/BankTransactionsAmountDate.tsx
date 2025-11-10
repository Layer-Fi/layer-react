import { HStack, VStack } from '@components/ui/Stack/Stack'
import { MoneySpan } from '@components/ui/Typography/MoneySpan'
import { Span } from '@components/ui/Typography/Text'
import { BankTransaction } from '@internal-types/bank_transactions'
import { isCredit } from '@utils/bankTransactions'
import { DateTime } from '@components/DateTime/DateTime'

const DATE_FORMAT = 'LLL d'

interface BankTransactionsAmountDateProps {
  bankTransaction: BankTransaction
}

export const BankTransactionsAmountDate = ({ bankTransaction }: BankTransactionsAmountDateProps) => {
  return (
    <VStack
      align='end'
      gap='3xs'
      pb='sm'
    >
      <HStack>
        <Span size='md'>
          {isCredit(bankTransaction) ? '+' : ''}
        </Span>
        <MoneySpan
          amount={bankTransaction.amount}
        />
      </HStack>

      <DateTime
        value={bankTransaction.date}
        dateFormat={DATE_FORMAT}
        onlyDate
        slotProps={{
          Date: { size: 'sm', variant: 'subtle' },
        }}
      />
    </VStack>
  )
}
