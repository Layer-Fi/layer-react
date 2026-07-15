import { type BankTransaction } from '@internal-types/bankTransactions'

import { bankTransactionStore } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { csvPresignedUrlResponse, formatCsvCents, formatCsvDate } from '@msw/utils/csvPresignedUrl'

const HEADER = ['Date', 'Transaction', 'Account', 'Direction', 'Amount', 'Category']

const toRow = (transaction: BankTransaction) => [
  formatCsvDate(transaction.date),
  transaction.counterpartyName ?? transaction.description ?? '',
  transaction.accountName ?? '',
  transaction.direction,
  formatCsvCents(transaction.amount),
  transaction.category?.displayName ?? '',
]

// The real endpoint returns a presigned URL to an xlsx; the mock serves the
// same rows as a CSV data URL so the download works without an S3 round trip.
export const get = createMockEndpoint<undefined, ReturnType<typeof csvPresignedUrlResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/reports/transactions/exports/excel',
  resolve: () => csvPresignedUrlResponse('bank-transactions.csv', [
    HEADER,
    ...bankTransactionStore.all().map(toRow),
  ]),
})
