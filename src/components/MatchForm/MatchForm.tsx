import { DATE_FORMAT } from '../../config/general'
import { useEffectiveBookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction } from '../../types'
import { isCategorizationEnabledForStatus } from '../../utils/bookkeeping/isCategorizationEnabled'
import { MatchBadge } from '../BankTransactionRow/MatchBadge'
import { Text, TextUseTooltip, ErrorText } from '../Typography'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

export interface MatchFormProps {
  classNamePrefix: string
  bankTransaction: BankTransaction
  selectedMatchId?: string
  setSelectedMatchId: (val?: string) => void
  matchFormError?: string
  readOnly?: boolean
}

export const MatchForm = ({
  classNamePrefix,
  bankTransaction,
  selectedMatchId,
  setSelectedMatchId,
  matchFormError,
  readOnly = false,
}: MatchFormProps) => {
  const bookkeepingStatus = useEffectiveBookkeepingStatus()
  const categorizedEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)

  const {
    suggested_matches: suggestedMatches = [],
    match,
  } = bankTransaction

  const effectiveSuggestedMatches = categorizedEnabled
    ? suggestedMatches.filter(
      ({ details: { id } }) => id === match?.details.id,
    )
    : suggestedMatches

  if (categorizedEnabled && effectiveSuggestedMatches.length === 0) {
    return null
  }

  return (
    <div className={`${classNamePrefix}__match-table`}>
      <div className={`${classNamePrefix}__match-table__header`}>
        <div className={`${classNamePrefix}__match-table__date`}>Date</div>
        <div className={`${classNamePrefix}__match-table__desc`}>
          Description
        </div>
        <div className={`${classNamePrefix}__match-table__amount`}>Amount</div>

        <div className={`${classNamePrefix}__match-table__status ${match ? '' : 'no-match'}`}>
        </div>
      </div>

      {effectiveSuggestedMatches.map((suggestedMatch) => {
        return (
          <div
            key={suggestedMatch.id}
            className={classNames(
              `${classNamePrefix}__match-row`,
              suggestedMatch.id === selectedMatchId
                ? `${classNamePrefix}__match-row--selected`
                : '',
            )}
            onClick={() => {
              if (readOnly === true) {
                return
              }
              if (selectedMatchId === suggestedMatch.id) {
                setSelectedMatchId(undefined)
                return
              }
              setSelectedMatchId(suggestedMatch.id)
            }}
          >
            <div
              className={`Layer__nowrap ${classNamePrefix}__match-table__date`}
            >
              <span>
                {formatTime(parseISO(suggestedMatch.details.date), DATE_FORMAT)}
              </span>
              <span className='amount-next-to-date'>
                $
                {formatMoney(suggestedMatch.details.amount)}
              </span>
            </div>
            <div className={`${classNamePrefix}__match-table__desc`}>
              <Text
                className={`${classNamePrefix}__match-table__desc-tooltip`}
                withTooltip={TextUseTooltip.whenTruncated}
                as='span'
              >
                {suggestedMatch.details.description}
              </Text>
              {suggestedMatch.details.id === bankTransaction.match?.details.id && (
                <span className='match-badge'>
                  <MatchBadge
                    classNamePrefix={classNamePrefix}
                    bankTransaction={bankTransaction}
                    dateFormat={DATE_FORMAT}
                    text='Matched'
                  />
                </span>
              )}
            </div>
            <div className={`${classNamePrefix}__match-table__amount`}>
              $
              {formatMoney(suggestedMatch.details.amount)}
            </div>

            <div
              className={`${classNamePrefix}__match-table__status ${
                bankTransaction.match ? '' : 'no-match'
              }`}
            >
              {suggestedMatch.details.id === match?.details.id && (
                <MatchBadge
                  classNamePrefix={classNamePrefix}
                  bankTransaction={bankTransaction}
                  dateFormat={DATE_FORMAT}
                  text='Matched'
                />
              )}
            </div>
          </div>
        )
      })}
      {matchFormError && <ErrorText>{matchFormError}</ErrorText>}
    </div>
  )
}
