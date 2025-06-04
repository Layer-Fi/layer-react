import { CustomAccountTransactionRow } from '../../hooks/customAccounts/types'

export const templateHeaders: { [K in keyof CustomAccountTransactionRow]: string } = {
  date: 'Date',
  description: 'Description',
  amount: 'Amount',
}

export const templateExampleTransactions: CustomAccountTransactionRow[] = [
  {
    date: '05/12/2025',
    description: 'Grocery Store Purchase',
    amount: -76.23,
  },
  {
    date: '05/18/2025',
    description: 'Monthly Interest',
    amount: 12.45,
  },
]
