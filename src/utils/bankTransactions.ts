import { filterVisibility } from '../components/BankTransactions/utils'
import { CategoryOption } from '../components/CategorySelect/CategorySelect'
import {BankTransaction, CategorizationScope, DateRange, Direction} from '../types'
import { endOfMonth, isWithinInterval, parseISO, startOfMonth } from 'date-fns'

export const hasMatch = (bankTransaction?: BankTransaction) => {
  return Boolean(
    (bankTransaction?.suggested_matches &&
      bankTransaction?.suggested_matches?.length > 0) ||
      bankTransaction?.match,
  )
}

export const isCredit = ({ direction }: Pick<BankTransaction, 'direction'>) =>
  direction === Direction.CREDIT

export const isAlreadyMatched = (bankTransaction?: BankTransaction) => {
  if (bankTransaction?.match) {
    const foundMatch = bankTransaction.suggested_matches?.find(
      x => x.details.id === bankTransaction?.match?.details.id,
    )
    return foundMatch?.id
  }

  return undefined
}

export const countTransactionsToReview = ({
  transactions,
  dateRange
}: {
  transactions?: BankTransaction[]
  dateRange?: DateRange
}) => {
  if (transactions && transactions.length > 0) {
    if (dateRange) {
      const dateRangeInterval = {
        start: dateRange.startDate,
        end: dateRange.endDate,
      }
      return transactions.filter(tx => {
        try {
          return (
            filterVisibility(CategorizationScope.TO_REVIEW, tx) &&
            isWithinInterval(parseISO(tx.date), dateRangeInterval)
          )
        } catch (_err) {
          return false
        }
      }).length
    }
    return transactions.filter(tx =>
      filterVisibility(CategorizationScope.TO_REVIEW, tx),
    ).length
  }

  return 0
}

export const getCategorizePayload = (category: CategoryOption) => {
  if (category?.payload && 'id' in category.payload && category.payload.id) {
    return {
      type: 'AccountId' as 'AccountId',
      id: category.payload.id,
    }
  }

  return {
    type: 'StableName' as 'StableName',
    stable_name: category?.payload.stable_name || '',
  }
}
