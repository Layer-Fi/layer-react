import { type AskFormTransaction } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { DateFormat } from '@utils/shared/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

const getAccountLabel = ({ accountName, accountMask }: Pick<AskFormTransaction, 'accountName' | 'accountMask'>) => {
  const parts = [accountName, accountMask ? `•••${accountMask}` : null].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : null
}

export const UnifiedAskFormTransactionCells = ({ transaction }: { transaction: AskFormTransaction }) => {
  const { formatDate } = useIntlFormatter()
  const { date, amount, description } = transaction
  const accountLabel = getAccountLabel(transaction)

  return (
    <>
      <Span className='Layer__UnifiedAskForm__RowDate' size='sm' variant='subtle' noWrap>
        {formatDate(date, DateFormat.MonthDayShort)}
      </Span>
      <VStack className='Layer__UnifiedAskForm__RowText'>
        <Span className='Layer__UnifiedAskForm__RowDescription' size='sm' variant='subtle' noWrap withTooltip>
          {description ?? ''}
        </Span>
        {accountLabel
          ? (
            <Span className='Layer__UnifiedAskForm__RowAccount' size='xs' variant='subtle' ellipsis>
              {accountLabel}
            </Span>
          )
          : null}
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
