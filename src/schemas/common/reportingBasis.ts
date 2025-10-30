import { Schema } from 'effect'

export enum ReportingBasis {
  Accrual = 'ACCRUAL',
  Cash = 'CASH',
}

export const ReportingBasisSchema = Schema.Enums(ReportingBasis)
