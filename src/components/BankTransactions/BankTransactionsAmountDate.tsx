import { DateFormat } from '@utils/i18n/date/patterns'
import { VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { DateTime } from '@components/DateTime/DateTime'

interface BankTransactionsAmountDateProps {
  amount: number
  date: Date
  slotProps?: {
    MoneySpan?: { size?: 'sm' | 'md', displayPlusSign?: boolean }
    DateTime?: { size?: 'xs' | 'sm' }
  }
}

export const BankTransactionsAmountDate = ({ amount, date, slotProps }: BankTransactionsAmountDateProps) => {
  return (
    <VStack align='end' gap='3xs'>
      <MoneySpan amount={amount} {...slotProps?.MoneySpan} />
      <DateTime
        valueAsDate={date}
        dateFormat={DateFormat.MonthDayShort}
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
