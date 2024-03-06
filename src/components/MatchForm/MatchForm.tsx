import React from 'react'
import { DATE_FORMAT } from '../../config/general'
import { centsToDollars as formatMoney } from '../../models/Money'
import { BankTransaction } from '../../types'
import { MatchBadge } from '../BankTransactionRow/MatchBadge'
import { Text, TextUseTooltip } from '../Typography/Text'
import classNames from 'classnames'
import { parseISO, format as formatTime } from 'date-fns'

export interface MatchFormProps {
  classNamePrefix: string
  bankTransaction: BankTransaction
  selectedMatchId?: string
  setSelectedMatchId: (val?: string) => void
}

export const MatchForm = ({
  classNamePrefix,
  bankTransaction,
  selectedMatchId,
  setSelectedMatchId,
}: MatchFormProps) => {
  return (
    <div className={`${classNamePrefix}__match-table`}>
      <div className={`${classNamePrefix}__match-table__header`}>
        <div className={`${classNamePrefix}__match-table__date`}>Date</div>
        <div className={`${classNamePrefix}__match-table__desc`}>
          Description
        </div>
        <div className={`${classNamePrefix}__match-table__amount`}>Amount</div>
        <div className={`${classNamePrefix}__match-table__status`}></div>
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
              {formatTime(parseISO(match.details.date), DATE_FORMAT)}
            </div>
            <div className={`${classNamePrefix}__match-table__desc`}>
              <Text
                className={`${classNamePrefix}__match-table__desc-tooltip`}
                withTooltip={TextUseTooltip.whenTruncated}
                as='span'
              >
                {match.details.description}
              </Text>
            </div>
            <div className={`${classNamePrefix}__match-table__amount`}>
              ${formatMoney(match.details.amount)}
            </div>
            <div className={`${classNamePrefix}__match-table__status`}>
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
    </div>
  )
}
