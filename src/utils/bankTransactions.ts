import { BankTransaction, Direction } from '../types'

export const hasMatch = (bankTransaction?: BankTransaction) => {
  return Boolean(
    (bankTransaction?.suggested_matches &&
      bankTransaction?.suggested_matches?.length > 0) ||
      bankTransaction?.match,
  )
}

export const isCredit = ({ direction }: Pick<BankTransaction, 'direction'>) =>
  direction === Direction.CREDIT
