import type { LedgerEntrySource } from '../types/ledger_accounts'
import type { LedgerEntrySourceType } from '../hooks/useProfitAndLoss/useProfitAndLossDetailLines'
import { LedgerEntrySourceSchema } from '../hooks/useProfitAndLoss/schemas'
import { Schema } from 'effect'

export type AnyLedgerEntrySource = LedgerEntrySource | LedgerEntrySourceType

/**
 * Type guard to check if a source is the new schema type (camelCase)
 */
export const isSchemaType = (source: AnyLedgerEntrySource): source is LedgerEntrySourceType => {
  return 'displayDescription' in source
}

/**
 * Type guard to check if a source is the legacy type (snake_case)
 */
export const isLegacyType = (source: AnyLedgerEntrySource): source is LedgerEntrySource => {
  return 'display_description' in source
}

/**
 * Convert from schema type (camelCase) to legacy type (snake_case)
 */
export const convertSchemaToLegacy = (source: LedgerEntrySourceType): LedgerEntrySource => {
  return Schema.encodeSync(LedgerEntrySourceSchema)(source)
}

/**
 * Convert from legacy type (snake_case) to schema type (camelCase)
 */
export const convertLegacyToSchema = (source: LedgerEntrySource): LedgerEntrySourceType => {
  return Schema.decodeUnknownSync(LedgerEntrySourceSchema)(source)
}

/**
 * Normalize any ledger entry source to legacy format
 * This function can accept either format and always returns the legacy format
 */
export const normalizeLedgerSource = (source: AnyLedgerEntrySource): LedgerEntrySource => {
  return isSchemaType(source) ? convertSchemaToLegacy(source) : source
}

/**
 * Normalize any ledger entry source to schema format
 * This function can accept either format and always returns the schema format
 */
export const normalizeToSchemaFormat = (source: AnyLedgerEntrySource): LedgerEntrySourceType => {
  return isLegacyType(source) ? convertLegacyToSchema(source) : source
}
