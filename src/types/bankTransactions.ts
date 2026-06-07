import { type S3PresignedUrl } from '@internal-types/general'
import {
  type BankTransactionSchema,
} from '@schemas/bankTransactions/bankTransaction'
import { type MatchSchema, type SuggestedMatchSchema } from '@schemas/bankTransactions/match'
import type { CustomerVendorSchema } from '@schemas/customerVendor'
import type { Tag } from '@schemas/tag'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'

export enum DisplayState {
  all = 'all',
  review = 'review',
  categorized = 'categorized',
}

/**
 * Derived from the decoded `BankTransactionSchema`. `recentlyCategorized`is a client-only
 * flag set during optimistic categorization and is not part of the API payload.
 */
export type BankTransaction =
  & typeof BankTransactionSchema.Type
  & { recentlyCategorized?: boolean }

export type SuggestedMatch = typeof SuggestedMatchSchema.Type

export type BankTransactionMatch = typeof MatchSchema.Type

export interface BankTransactionMetadata {
  memo: string | null
}

export interface DocumentS3Urls {
  type: 'Document_S3_Urls'
  documentUrls: S3PresignedUrl[]
}

export type Split = {
  amount: number
  category: BankTransactionNonSuggestedMatchOption | null
  taxCode?: string | null
  tags: readonly Tag[]
  customerVendor: typeof CustomerVendorSchema.Type | null
}
