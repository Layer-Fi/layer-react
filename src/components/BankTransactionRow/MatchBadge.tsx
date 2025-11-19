import { format as formatTime, parseISO } from 'date-fns'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { centsToDollars as formatMoney } from '@models/Money'
import MinimizeTwo from '@icons/MinimizeTwo'
import { Badge } from '@components/Badge/Badge'

export interface MatchBadgeProps {
  bankTransaction: BankTransaction
  classNamePrefix: string
  dateFormat: string
  text?: string
}

export const MatchBadge = ({
  bankTransaction,
  classNamePrefix,
  dateFormat,
  text = 'Match',
}: MatchBadgeProps) => {
  if (
    bankTransaction.categorization_status === CategorizationStatus.MATCHED
    && bankTransaction.match
  ) {
    const { date, amount } = bankTransaction.match.bank_transaction

    return (
      <Badge
        icon={<MinimizeTwo size={11} />}
        tooltip={(
          <span className={`${classNamePrefix}__match-tooltip`}>
            <div className={`${classNamePrefix}__match-tooltip__date`}>
              {formatTime(parseISO(date), dateFormat)}
            </div>
            <div className={`${classNamePrefix}__match-tooltip__description`}>
              {bankTransaction.match?.details?.description ?? ''}
            </div>
            <div className={`${classNamePrefix}__match-tooltip__amount`}>
              $
              {formatMoney(amount)}
            </div>
          </span>
        )}
      >
        {text}
      </Badge>
    )
  }

  return
}
