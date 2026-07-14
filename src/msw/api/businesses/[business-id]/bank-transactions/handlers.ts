import { type RequestHandler } from 'msw'

import { bankTransactionHandlers } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/handlers'
import { post as postBulkCategorize } from '@msw/api/businesses/[business-id]/bank-transactions/bulk-categorize/post'
import { post as postBulkMatchOrCategorize } from '@msw/api/businesses/[business-id]/bank-transactions/bulk-match-or-categorize/post'
import { post as postBulkUncategorize } from '@msw/api/businesses/[business-id]/bank-transactions/bulk-uncategorize/post'
import { get as getBankTransactions } from '@msw/api/businesses/[business-id]/bank-transactions/get'
import { del as deleteBankTransactionTags } from '@msw/api/businesses/[business-id]/bank-transactions/tags/delete'
import { post as postBankTransactionTags } from '@msw/api/businesses/[business-id]/bank-transactions/tags/post'

export const bankTransactionsHandlers: RequestHandler[] = [
  getBankTransactions.handler,
  postBulkCategorize.handler,
  postBulkMatchOrCategorize.handler,
  postBulkUncategorize.handler,
  postBankTransactionTags.handler,
  deleteBankTransactionTags.handler,
  ...bankTransactionHandlers,
]
