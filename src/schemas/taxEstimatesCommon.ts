import { Schema } from 'effect'

export enum FilingStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  MARRIED_SEPARATELY = 'MARRIED_SEPARATELY',
  HEAD = 'HEAD',
  WIDOWER = 'WIDOWER',
}

export const FilingStatusSchema = Schema.Enums(FilingStatus)

export type TaxReportingBasis = 'ACCRUAL' | 'CASH'
