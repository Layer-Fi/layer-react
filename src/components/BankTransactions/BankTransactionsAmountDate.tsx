import { HStack, VStack } from '@components/ui/Stack/Stack'
import { MoneySpan } from '@components/ui/Typography/MoneySpan'
import { Span } from '@components/ui/Typography/Text'
import { DateTime } from '@components/DateTime/DateTime'

const DATE_FORMAT = 'LLL d'

interface BankTransactionsAmountDateProps {
  amount: number
  date: string
  plusSign?: boolean
  slotProps?: {
    amount?: { size: 'sm' | 'md' }
    date?: { size: 'xs' | 'sm' }
  }
}

export const BankTransactionsAmountDate = ({ amount, date, plusSign, slotProps }: BankTransactionsAmountDateProps) => {
  return (
    <VStack
      align='end'
      gap='3xs'
      pb='sm'
    >
      <HStack>
        <Span {...slotProps?.amount}>
          {plusSign ? '+' : ''}
        </Span>
        <MoneySpan
          amount={amount}
          size={slotProps?.amount?.size}
        />
      </HStack>

      <DateTime
        value={date}
        dateFormat={DATE_FORMAT}
        onlyDate
        slotProps={{
          Date: { size: slotProps?.date?.size ?? 'sm', variant: 'subtle' },
        }}
      />
    </VStack>
  )
}
