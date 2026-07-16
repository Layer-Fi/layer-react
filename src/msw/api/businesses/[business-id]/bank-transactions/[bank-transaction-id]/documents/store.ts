import { type S3PresignedUrl } from '@internal-types/general'

import { createMockStore } from '@msw/utils/createMockStore'

type BankTransactionDocuments = {
  /** The owning bank transaction's id. */
  id: string
  documentUrls: S3PresignedUrl[]
}

/** Uploaded documents per bank transaction - starts empty and fills as tests upload receipts. */
export const bankTransactionDocumentsStore = createMockStore<BankTransactionDocuments>(() => [])

export const findDocuments = (bankTransactionId: string): BankTransactionDocuments =>
  bankTransactionDocumentsStore.findById(bankTransactionId)
  ?? { id: bankTransactionId, documentUrls: [] }
