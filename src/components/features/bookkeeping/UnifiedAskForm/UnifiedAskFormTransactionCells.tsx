import { useTranslation } from 'react-i18next'

import { type AskFormTransaction } from '@schemas/features/bookkeeping/businessTasks/unifiedAskFormTask'
import { getBankAccountLabelWithMask } from '@utils/features/bankAccounts/bankAccount'
import { DateFormat } from '@utils/shared/i18n/date/patterns'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { VStack } from '@ui/Stack/Stack'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'

export const UnifiedAskFormTransactionCells = ({ transaction }: { transaction: AskFormTransaction }) => {
  const { date, amount, description, accountName, accountMask } = transaction
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const accountLabel = accountName ? getBankAccountLabelWithMask(t, { accountName, mask: accountMask ?? null }) : null

  return (
    <>
      <Span className='Layer__UnifiedAskForm__RowDate' size='sm' variant='subtle' noWrap>
        {formatDate(date, DateFormat.MonthDayShort)}
      </Span>
      <VStack className='Layer__UnifiedAskForm__RowText'>
        <Span size='sm' variant='subtle' withTooltip>
          {description ?? ''}
        </Span>
        {accountLabel
          ? (
            <Span size='xs' variant='subtle' ellipsis>
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
