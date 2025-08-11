import { CustomAccountTransactionRow } from '../../hooks/customAccounts/types'

export const templateHeaders: { [K in keyof CustomAccountTransactionRow]: string } = {
  date: 'Date',
  description: 'Description',
  amount: 'Amount',
}

export const allHeaders: { [K in keyof CustomAccountTransactionRow]: string } = {
  external_id: 'External ID',
  reference_number: 'Reference Number',
  ...templateHeaders,
}

export const templateExampleTransactions: CustomAccountTransactionRow[] = [
  {
    date: '05/12/2025',
    description: 'Grocery Store Purchase',
    amount: -76.23,
    external_id: null,
    reference_number: '123',
  },
  {
    date: '05/18/2025',
    description: 'Monthly Interest',
    amount: 12.45,
    external_id: 'txn-31415',
  },
]
