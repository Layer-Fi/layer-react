import { Transaction } from '../types'

type FormatParameters = Pick<Transaction, 'amount'> &
  Pick<Partial<Transaction>, 'direction'>
const format = ({ amount, direction }: FormatParameters) =>
  (direction === 'CREDIT' ? '+' : '-') +
  Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    amount / 100,
  )

export const Money = {
  format,
}
