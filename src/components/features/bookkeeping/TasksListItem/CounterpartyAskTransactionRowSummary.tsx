import { BankTransactionDirection, type MinimalBankTransaction } from '@schemas/features/bankTransactions/base'
import { DateFormat } from '@utils/shared/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { HStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

type CounterpartyAskTransactionRowSummaryProps = {
  transaction: MinimalBankTransaction
  answerLabel: string | null
}

export const CounterpartyAskTransactionRowSummary = ({
  transaction,
  answerLabel,
}: CounterpartyAskTransactionRowSummaryProps) => {
  const { formatDate } = useIntlFormatter()

  return (
    <HStack align='center' gap='xs' overflow='hidden' fluid>
      <MoneySpan
        className='Layer__CounterpartyAskTask__RowSummaryAmount'
        size='sm'
        weight='bold'
        numeric='tabular-nums'
        amount={transaction.amount}
        displayPlusSign={transaction.direction === BankTransactionDirection.Credit}
      />
      <Span className='Layer__CounterpartyAskTask__RowSummaryDate' size='sm' variant='subtle' noWrap>
        {formatDate(transaction.date, DateFormat.MonthDayShort)}
      </Span>
      <Span
        className='Layer__CounterpartyAskTask__RowSummaryDescription'
        size='sm'
        variant='subtle'
        ellipsis
        noWrap
      >
        {transaction.description ?? ''}
      </Span>
      {answerLabel
        ? (
          <Span
            className='Layer__CounterpartyAskTask__RowSummaryAnswer'
            size='sm'
            align='right'
            ellipsis
            noWrap
          >
            {answerLabel}
          </Span>
        )
        : null}
    </HStack>
  )
}
