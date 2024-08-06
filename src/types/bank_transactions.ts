import { Categorization, CategorizationStatus, Category } from './categories'
import { S3PresignedUrl } from './general'

export enum Direction {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum BankTransactionMatchType {
  CONFIRM_MATCH = 'Confirm_Match',
}

export enum DisplayState {
  review = 'review',
  categorized = 'categorized',
}

// This isn't my favorite but BankTransaction contains much
// more than we're using right now.
export interface BankTransaction extends Record<string, unknown> {
  type: 'Bank_Transaction'
  account_name?: string
  business_id: string
  recently_categorized?: boolean
  id: string
  date: string
  source: string
  source_transaction_id: string
  source_account_id: string
  imported_at: string
  description: string | null
  amount: number
  direction: Direction
  counterparty_name: string
  category: Category
  categorization_status: CategorizationStatus
  categorization_flow: Categorization | null
  categorization_method: string
  error?: string
  processing?: boolean
  suggested_matches?: SuggestedMatch[]
  match?: BankTransactionMatch
}

export interface SuggestedMatch {
  id: string
  matchType: string
  details: {
    amount: number
    date: string
    description: string
    id: string
    type: string
  }
}

export interface BankTransactionMatch {
  bank_transaction: BankTransaction
  id: string
  match_type?: string
  details: {
    amount: number
    date: string
    description: string
    id: string
    type: string
  }
}

export interface BankTransactionMetadata {
  memo: string | null
}

export interface DocumentS3Urls {
  type: 'Document_S3_Urls'
  documentUrls: S3PresignedUrl[]
}

export interface FileMetadata {
  type: 'File_Metadata'
  id: string | null
  fileType: string
  fileName: string
  documentType: string
}
