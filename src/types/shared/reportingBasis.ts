import type { EnumWithUnknownValues } from '@internal-types/utility/enumWithUnknownValues'

type StrictReportingBasis = 'CASH' | 'CASH_COLLECTED' | 'ACCRUAL'
export type ReportingBasis = EnumWithUnknownValues<StrictReportingBasis>
