import { DisplayState } from '../components/BankTransactions/constants'
import { filterVisibility } from '../components/BankTransactions/utils'
import { BankTransaction, Direction } from '../types'
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
  currentMonthOnly,
}: {
  transactions?: BankTransaction[]
  currentMonthOnly?: boolean
}) => {
  if (transactions && transactions.length > 0) {
    if (currentMonthOnly) {
      const currentMonth = {
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
      }
      return transactions.filter(tx => {
        try {
          return (
            filterVisibility(DisplayState.review, tx) &&
            isWithinInterval(parseISO(tx.date), currentMonth)
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
