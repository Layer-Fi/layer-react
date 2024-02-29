import React from 'react'
import Scissors from '../../icons/Scissors'
import { BankTransaction, CategorizationStatus } from '../../types'
import { Badge } from '../Badge'
import { extractDescriptionForSplit } from '../BankTransactionRow/BankTransactionRow'
import { MatchBadge } from '../BankTransactionRow/MatchBadge'
import { SplitTooltipDetails } from '../BankTransactionRow/SplitTooltipDetails'
import { Pill } from '../Pill'
import { parseISO, format as formatTime } from 'date-fns'

const dateFormat = 'LLL d, yyyy'

export interface AssignmentProps {
  bankTransaction: BankTransaction
}

export const Assignment = ({ bankTransaction }: AssignmentProps) => {
  if (
    bankTransaction.match &&
    bankTransaction.categorization_status === CategorizationStatus.MATCHED
  ) {
    return (
      <>
        <MatchBadge
          classNamePrefix='Layer__bank-transaction-list-item'
          bankTransaction={bankTransaction}
          dateFormat={dateFormat}
          text='Matched'
        />
        <Pill>
          <span className='Layer__bank-transaction-list-item__category-text__text'>
            {`${formatTime(
              parseISO(bankTransaction.match.bank_transaction.date),
              dateFormat,
            )}, ${bankTransaction.match.bank_transaction.description}`}
          </span>
        </Pill>
      </>
    )
  }

  if (bankTransaction.categorization_status === CategorizationStatus.SPLIT) {
    return (
      <>
        <Badge
          icon={<Scissors size={11} />}
          tooltip={
            <SplitTooltipDetails
              classNamePrefix='Layer__bank-transaction-list-item'
              category={bankTransaction.category}
            />
          }
        >
          Split
        </Badge>
        <Pill>
          <span className='Layer__bank-transaction-list-item__category-text__text'>
            {extractDescriptionForSplit(bankTransaction.category)}
          </span>
        </Pill>
      </>
    )
  }

  return <Pill>{bankTransaction?.category?.display_name}</Pill>
}
