import { Schema } from 'effect'

export enum LedgerEntryDirection {
  Credit = 'CREDIT',
  Debit = 'DEBIT',
}
export const LedgerEntryDirectionSchema = Schema.Enums(LedgerEntryDirection)
