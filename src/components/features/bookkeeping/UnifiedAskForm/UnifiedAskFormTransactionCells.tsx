import { type AskFormTransaction } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { DateFormat } from '@utils/shared/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

export const UnifiedAskFormTransactionCells = ({ transaction }: { transaction: AskFormTransaction }) => {
  const { date, amount, description, accountName, accountMask } = transaction
  const { formatDate } = useIntlFormatter()

  return (
    <>
      <Span className='Layer__UnifiedAskForm__RowDate' size='sm' variant='subtle' noWrap>
        {formatDate(date, DateFormat.MonthDayShort)}
      </Span>
      <VStack className='Layer__UnifiedAskForm__RowText'>
        <Span size='sm' variant='subtle' withTooltip>
          {description ?? ''}
        </Span>
        {accountName && (
          <Span size='xs' variant='subtle' ellipsis>
            {accountName}
            {accountMask && ` •••${accountMask}`}
          </Span>
        )}
      </VStack>
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
