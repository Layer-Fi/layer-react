import { type RequestHandler } from 'msw'

import { put as putCategorizeBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/categorize/put'
import { post as postArchiveBankTransactionDocument } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/documents/[document-id]/archive/post'
import { get as getBankTransactionDocuments } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/documents/get'
import { post as postBankTransactionDocument } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/documents/post'
import { put as putMatchBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/match/put'
import { get as getBankTransactionMetadata } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/get'
import { patch as patchBankTransactionMetadata } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/patch'
import { put as putBankTransactionMetadata } from '@msw/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/metadata/put'

export const bankTransactionHandlers: RequestHandler[] = [
  putCategorizeBankTransaction.handler,
  putMatchBankTransaction.handler,
  getBankTransactionMetadata.handler,
  putBankTransactionMetadata.handler,
  patchBankTransactionMetadata.handler,
  getBankTransactionDocuments.handler,
  postBankTransactionDocument.handler,
  postArchiveBankTransactionDocument.handler,
]
