import { type AskFormTransaction } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { DateFormat } from '@utils/shared/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

export const UnifiedAskFormTransactionCells = ({ transaction: { date, amount, description } }: { transaction: AskFormTransaction }) => {
  const { formatDate } = useIntlFormatter()

  return (
    <>
      <Span className='Layer__UnifiedAskForm__RowDate' size='xs' variant='subtle' noWrap>
        {formatDate(date, DateFormat.MonthDayShort)}
      </Span>
      <Span className='Layer__UnifiedAskForm__RowDescription' size='sm' variant='subtle' noWrap withTooltip>
        {description ?? ''}
      </Span>
      <MoneySpan
        className='Layer__UnifiedAskForm__RowAmount'
        size='sm'
        weight='bold'
        numeric='tabular-nums'
        align='right'
        amount={amount}
        displayPlusSign={amount > 0}
      />
    </>
  )
}
