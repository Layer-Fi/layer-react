import { DateTime } from '@components/DateTime/DateTime'
import { HStack, VStack } from '@components/ui/Stack/Stack'
import { MoneySpan } from '@components/ui/Typography/MoneySpan'

const DATE_FORMAT = 'LLL d'

interface BankTransactionsAmountDateProps {
  amount: number
  date: string
  slotProps?: {
    MoneySpan?: { size?: 'sm' | 'md', displayPlusSign?: boolean }
    DateTime?: { size?: 'xs' | 'sm' }
  }
}

export const BankTransactionsAmountDate = ({ amount, date, slotProps }: BankTransactionsAmountDateProps) => {
  return (
    <VStack
      align='end'
      gap='3xs'
      pb='sm'
    >
      <HStack>
        <MoneySpan
          amount={amount}
          {...slotProps?.MoneySpan}
        />
      </HStack>

      <DateTime
        value={date}
        dateFormat={DATE_FORMAT}
        onlyDate
        slotProps={{
          Date: {
            variant: 'subtle',
            size: 'sm',
            ...slotProps?.DateTime,
          },
        }}
      />
    </VStack>
  )
}
