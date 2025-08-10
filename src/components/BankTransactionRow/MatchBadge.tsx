import MinimizeTwo from '../../icons/MinimizeTwo'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction, CategorizationStatus } from '../../types'
import { Badge } from '../Badge'
import { parseISO, format as formatTime } from 'date-fns'
import { useMatchDetailsContext } from '../../contexts/MatchDetailsContext'

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
  const { convertToSourceLink } = useMatchDetailsContext()

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
              {convertToSourceLink && bankTransaction.match?.details ? (
                <a
                  href={convertToSourceLink(bankTransaction.match.details).href}
                  target={convertToSourceLink(bankTransaction.match.details).target}
                >
                  {convertToSourceLink(bankTransaction.match.details).text}
                </a>
              ) : (
                bankTransaction.match?.details?.description ?? ''
              )}
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
