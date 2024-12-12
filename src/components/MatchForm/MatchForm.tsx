import React from 'react'
import { DATE_FORMAT } from '../../config/general'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction } from '../../types'
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
  return (
    <div className={`${classNamePrefix}__match-table`}>
      <div className={`${classNamePrefix}__match-table__header`}>
        <div className={`${classNamePrefix}__match-table__date`}>Date</div>
        <div className={`${classNamePrefix}__match-table__desc`}>
          Description
        </div>
        <div className={`${classNamePrefix}__match-table__amount`}>Amount</div>

        <div
          className={`${classNamePrefix}__match-table__status ${
            bankTransaction.match ? '' : 'no-match'
          }`}
        >
        </div>
      </div>

      {bankTransaction.suggested_matches?.map((match, idx) => {
        return (
          <div
            key={idx}
            className={classNames(
              `${classNamePrefix}__match-row`,
              match.id === selectedMatchId
                ? `${classNamePrefix}__match-row--selected`
                : '',
            )}
            onClick={() => {
              if (readOnly === true) {
                return
              }
              if (selectedMatchId === match.id) {
                setSelectedMatchId(undefined)
                return
              }
              setSelectedMatchId(match.id)
            }}
          >
            <div
              className={`Layer__nowrap ${classNamePrefix}__match-table__date`}
            >
              <span>
                {formatTime(parseISO(match.details.date), DATE_FORMAT)}
              </span>
              <span className='amount-next-to-date'>
                $
                {formatMoney(match.details.amount)}
              </span>
            </div>
            <div className={`${classNamePrefix}__match-table__desc`}>
              <Text
                className={`${classNamePrefix}__match-table__desc-tooltip`}
                withTooltip={TextUseTooltip.whenTruncated}
                as='span'
              >
                {match.details.description}
              </Text>
              {match.details.id === bankTransaction.match?.details.id && (
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
              {formatMoney(match.details.amount)}
            </div>

            <div
              className={`${classNamePrefix}__match-table__status ${
                bankTransaction.match ? '' : 'no-match'
              }`}
            >
              {match.details.id === bankTransaction.match?.details.id && (
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
