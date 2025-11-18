import type { CustomerSchema } from '@schemas/customer'
import type { VendorSchema } from '@schemas/vendor'
import { MatchDetailsType } from '@schemas/bankTransactions/match'
import { Categorization } from '@internal-types/categories'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { S3PresignedUrl, type Direction } from '@internal-types/general'
import type { Tag, TransactionTagEncoded } from '@features/tags/tagSchemas'
import { UpdateCategorizationRulesSuggestionSchema } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import type { CategorizationEncoded } from '@schemas/categorization'
import type { CustomerVendorSchema } from '@features/customerVendor/customerVendorSchemas'
import type { BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'

export enum BankTransactionMatchType {
  CONFIRM_MATCH = 'Confirm_Match',
}

export enum DisplayState {
  all = 'all',
  review = 'review',
  categorized = 'categorized',
}

export interface AccountInstitution {
  name: string
  logo: string | null
}

// This isn't my favorite but BankTransaction contains much
// more than we're using right now.
export interface BankTransaction extends Record<string, unknown> {
  type: 'Bank_Transaction'
  account_name?: string
  account_institution?: AccountInstitution
  account_mask?: string
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
  category: CategorizationEncoded | null
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
  update_categorization_rules_suggestion?: typeof UpdateCategorizationRulesSuggestionSchema.Encoded | null
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

export type Split = {
  amount: number
  category: BankTransactionCategoryComboBoxOption | null
  tags: readonly Tag[]
  customerVendor: typeof CustomerVendorSchema.Type | null
}
