import { filterVisibility } from '../components/BankTransactions/utils'
import { DateRange } from '../types/general'
import { BankTransaction, DisplayState } from '../types/bank_transactions'
import { Direction } from '../types/general'
import { isWithinInterval, parseISO } from 'date-fns'

export const hasMatch = (bankTransaction?: BankTransaction) => {
  return Boolean(
    (bankTransaction?.suggested_matches
      && bankTransaction?.suggested_matches?.length > 0)
    || bankTransaction?.match,
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
      return transactions.filter((tx) => {
        try {
          return (
            filterVisibility(DisplayState.review, tx)
            && isWithinInterval(parseISO(tx.date), dateRangeInterval)
          )
        }
        catch (_err) {
          return false
        }
      }).length
    }
    return transactions.filter(tx => filterVisibility(DisplayState.review, tx))
      .length
  }

  return 0
}

export const hasReceipts = (bankTransaction?: BankTransaction) =>
  bankTransaction?.document_ids && bankTransaction.document_ids.length > 0

export const isTransferMatch = (bankTransaction?: BankTransaction) => {
  return bankTransaction?.match?.details.type === 'Transfer_Match'
}

export const hasSuggestedTransferMatches = (bankTransaction?: BankTransaction) => {
  return bankTransaction?.suggested_matches?.every(x => x.details.type === 'Transfer_Match') ?? false
}
