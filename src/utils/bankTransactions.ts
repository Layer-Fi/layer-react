import { filterVisibility } from '../components/BankTransactions/utils'
import { CategoryOption } from '../components/CategorySelect/CategorySelect'
import { BankTransaction, DateRange, Direction, DisplayState } from '../types'
import { isWithinInterval, parseISO } from 'date-fns'

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
  dateRange,
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
            filterVisibility(DisplayState.review, tx) &&
            isWithinInterval(parseISO(tx.date), dateRangeInterval)
          )
        } catch (_err) {
          return false
        }
      }).length
    }
    return transactions.filter(tx => filterVisibility(DisplayState.review, tx))
      .length
  }

  return 0
}

export const getCategorizePayload = (category: CategoryOption) => {
  if (
    category?.payload &&
    'id' in category.payload &&
    category.payload.type == 'ExclusionNested'
  ) {
    return {
      type: 'Exclusion' as const,
      exclusion_type: category.payload.id,
    }
  }

  if (category?.payload && 'id' in category.payload && category.payload.id) {
    return {
      type: 'AccountId' as const,
      id: category.payload.id,
    }
  }

  return {
    type: 'StableName' as const,
    stable_name: category?.payload.stable_name || '',
  }
}

export const hasReceipts = (bankTransaction?: BankTransaction) =>
  bankTransaction?.document_ids && bankTransaction.document_ids.length > 0
