import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { isTransferMatch } from '@hooks/utils/bankTransactions/shared'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import MinimizeTwo from '@icons/MinimizeTwo'
import { Badge } from '@components/Badge/Badge'

import './matchBadge.scss'

interface MatchTooltipProps {
  amount: number
  date: string
  description: string
}

const MatchTooltip = ({ amount, date, description }: MatchTooltipProps) => {
  const { formatDate, formatCurrencyFromCents } = useIntlFormatter()

  return (
    <span className='Layer__MatchTooltip'>
      <div className='Layer__MatchTooltip__date'>
        {formatDate(date)}
      </div>
      <div className='Layer__MatchTooltip__description'>
        {description}
      </div>
      <div className='Layer__MatchTooltip__amount'>
        {formatCurrencyFromCents(amount)}
      </div>
    </span>
  )
}

export interface MatchBadgeProps {
  bankTransaction: BankTransaction
}

export const MatchBadge = ({ bankTransaction }: MatchBadgeProps) => {
  const { t } = useTranslation()

  const text = isTransferMatch(bankTransaction)
    ? t('bankTransactions:label.transfer', 'Transfer')
    : t('bankTransactions:label.matched', 'Matched')

  if (
    bankTransaction.categorization_status === CategorizationStatus.MATCHED
    && bankTransaction.match
  ) {
    const { date, amount } = bankTransaction.match.bank_transaction
    const description = bankTransaction.match.details?.description ?? ''

    return (
      <Badge
        icon={<MinimizeTwo size={11} />}
        tooltip={<MatchTooltip amount={amount} date={date} description={description} />}
      >
        {text}
      </Badge>
    )
  }

  return null
}
