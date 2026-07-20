import { type RequestHandler } from 'msw'

import { put as putCategorizeBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/categorize/put'
import { post as postArchiveBankTransactionDocument } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/documents/[document-id]/archive/post'
import { get as getBankTransactionDocuments } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/documents/get'
import { post as postBankTransactionDocument } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/documents/post'
import { put as putMatchBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/match/put'
import { patch as patchBankTransactionMetadata } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/patch'

export const bankTransactionHandlers: RequestHandler[] = [
  putCategorizeBankTransaction.handler,
  putMatchBankTransaction.handler,
  patchBankTransactionMetadata.handler,
  getBankTransactionDocuments.handler,
  postBankTransactionDocument.handler,
  postArchiveBankTransactionDocument.handler,
]
