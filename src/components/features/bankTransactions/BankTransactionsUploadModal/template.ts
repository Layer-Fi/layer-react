import { type CustomAccountTransactionRow } from '@schemas/customAccounts'

export const templateHeaders: { [K in keyof CustomAccountTransactionRow]: string } = {
  date: 'Date',
  description: 'Description',
  amount: 'Amount',
}

export const allHeaders: { [K in keyof CustomAccountTransactionRow]: string } = {
  externalId: 'External ID',
  referenceNumber: 'Reference Number',
  ...templateHeaders,
}

export const templateExampleTransactions: CustomAccountTransactionRow[] = [
  {
    date: '05/12/2025',
    description: 'Grocery Store Purchase',
    amount: -76.23,
    externalId: null,
    referenceNumber: '123',
  },
  {
    date: '05/18/2025',
    description: 'Monthly Interest',
    amount: 12.45,
    externalId: 'txn-31415',
  },
]
