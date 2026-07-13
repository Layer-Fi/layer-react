import type { EnumWithUnknownValues } from '@internal-types/utility/enumWithUnknownValues'

export type View = 'mobile' | 'tablet' | 'desktop'

export interface BaseSelectOption {
  label: string
  value: string | number
}

export interface S3PresignedUrl {
  type: 'S3_Presigned_Url'
  presignedUrl: string
  fileType: string
  fileName: string
  createdAt: string
  documentId?: string
}

export type LoadedStatus = 'initial' | 'loading' | 'complete'

export type DateRange<T = Date> = {
  startDate: T
  endDate: T
}
type StrictReportingBasis = 'CASH' | 'CASH_COLLECTED' | 'ACCRUAL'
export type ReportingBasis = EnumWithUnknownValues<StrictReportingBasis>

export type MoneyFormat = 'CENTS' | 'DOLLAR_STRING'

export enum Direction {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}
