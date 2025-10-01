import type { CustomerSchema } from '../schemas/customer'
import type { VendorSchema } from '../schemas/vendor'
import { MatchDetailsType } from '../schemas/bankTransactions/match'
import { Categorization, Category } from './categories'
import { CategorizationStatus } from '../schemas/bankTransactions/bankTransaction'
import { S3PresignedUrl } from './general'
import type { TransactionTagEncoded } from '../features/tags/tagSchemas'

export enum Direction {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum BankTransactionMatchType {
  CONFIRM_MATCH = 'Confirm_Match',
}

export enum DisplayState {
  all = 'all',
  review = 'review',
  categorized = 'categorized',
}

export type CategoryWithEntries = Category & { entries?: Array<CategoryEntry> }
type CategoryEntry = {
  type?: string
  amount?: number
  category: CategoryWithEntries
  tags?: Array<TransactionTagEncoded>
  customer?: typeof CustomerSchema.Encoded | null
  vendor?: typeof VendorSchema.Encoded | null
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
  category: CategoryWithEntries | null
  categorization_status: CategorizationStatus
  categorization_flow: Categorization | null
  categorization_method: string
  error?: string
  processing?: boolean
  suggested_matches?: SuggestedMatch[]
  match?: BankTransactionMatch
  document_ids: string[]
  transaction_tags: ReadonlyArray<TransactionTagEncoded>

  customer: typeof CustomerSchema.Encoded | null
  vendor: typeof VendorSchema.Encoded | null
}

export interface SuggestedMatch {
  id: string
  matchType: string
  details: MatchDetailsType
}

export interface BankTransactionMatch {
  bank_transaction: BankTransaction
  id: string
  match_type: string
  details: MatchDetailsType
}

export interface BankTransactionMetadata {
  memo: string | null
}

export interface DocumentS3Urls {
  type: 'Document_S3_Urls'
  documentUrls: S3PresignedUrl[]
}
