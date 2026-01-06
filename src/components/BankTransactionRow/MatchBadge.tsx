import { format as formatTime, parseISO } from 'date-fns'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { centsToDollars as formatMoney } from '@models/Money'
import MinimizeTwo from '@icons/MinimizeTwo'
import { Badge } from '@components/Badge/Badge'

import './matchBadge.scss'

interface MatchTooltipProps {
  amount: number
  date: string
  dateFormat: string
  description: string
}

const MatchTooltip = ({ amount, date, dateFormat, description }: MatchTooltipProps) => {
  return (
    <span className='Layer__MatchTooltip'>
      <div className='Layer__MatchTooltip--date'>
        {formatTime(parseISO(date), dateFormat)}
      </div>
      <div className='Layer__MatchTooltip--description'>
        {description}
      </div>
      <div className='Layer__MatchTooltip--amount'>
        $
        {formatMoney(amount)}
      </div>
    </span>
  )
}

export interface MatchBadgeProps {
  bankTransaction: BankTransaction
  dateFormat: string
  text?: string
}

export const MatchBadge = ({
  bankTransaction,
  dateFormat,
  text = 'Match',
}: MatchBadgeProps) => {
  if (
    bankTransaction.categorization_status === CategorizationStatus.MATCHED
    && bankTransaction.match
  ) {
    const { date, amount } = bankTransaction.match.bank_transaction
    const description = bankTransaction.match.details?.description ?? ''

    return (
      <Badge
        icon={<MinimizeTwo size={11} />}
        tooltip={<MatchTooltip amount={amount} date={date} dateFormat={dateFormat} description={description} />}
      >
        {text}
      </Badge>
    )
  }

  return null
}
