import { DATE_FORMAT } from '../../config/general'
import { useEffectiveBookkeepingStatus } from '../../hooks/bookkeeping/useBookkeepingStatus'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction } from '../../types'
import { isCategorizationEnabledForStatus } from '../../utils/bookkeeping/isCategorizationEnabled'
import { MatchBadge } from '../BankTransactionRow/MatchBadge'
import { Text, TextUseTooltip, ErrorText } from '../Typography'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'
import { useInAppLinkContext } from '../../contexts/InAppLinkContext'
import { convertMatchDetailsToLinkingMetadata, decodeMatchDetails } from '../../schemas/bankTransactions/match'

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
  const categorizationEnabled = isCategorizationEnabledForStatus(bookkeepingStatus)
  const { renderInAppLink } = useInAppLinkContext()

  const {
    suggested_matches: suggestedMatches = [],
    match,
  } = bankTransaction

  const effectiveSuggestedMatches = categorizationEnabled
    ? suggestedMatches
    : suggestedMatches.filter(
      ({ details: { id } }) => id === match?.details.id,
    )

  if (!categorizationEnabled && effectiveSuggestedMatches.length === 0) {
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
        {renderInAppLink && <div className={`${classNamePrefix}__match-table__link`}>Link</div>}
        {match && <div className={`${classNamePrefix}__match-table__status`} />}
      </div>
      {effectiveSuggestedMatches.map((suggestedMatch) => {
        const matchDetails = suggestedMatch.details ? decodeMatchDetails(suggestedMatch.details) : undefined
        const inAppLink = renderInAppLink && matchDetails ? renderInAppLink(convertMatchDetailsToLinkingMetadata(matchDetails)) : null
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
            <div className={`Layer__nowrap ${classNamePrefix}__match-table__date`}>
              <span>
                {formatTime(parseISO(suggestedMatch.details.date), DATE_FORMAT)}
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
            </div>
            <div className={`${classNamePrefix}__match-table__amount`}>
              $
              {formatMoney(suggestedMatch.details.amount)}
            </div>
            {inAppLink && (
              <div className={`${classNamePrefix}__match-table__link`}>
                {inAppLink}
              </div>
            )}
            {
              bankTransaction.match && (
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
              )
            }
          </div>
        )
      })}
      {matchFormError && <ErrorText>{matchFormError}</ErrorText>}
    </div>
  )
}
