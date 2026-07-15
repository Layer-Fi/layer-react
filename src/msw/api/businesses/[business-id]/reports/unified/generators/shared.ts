import { isValid, parseISO, subMonths } from 'date-fns'

import { LedgerAccountType, LedgerEntryDirection, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'
import { type ReportConfig, type ReportControl } from '@schemas/reports/reportConfig'
import {
  Alignment,
  Pinning,
  type UnifiedReportCell,
  type UnifiedReportColumn,
} from '@schemas/reports/unifiedReport'

import { type EntryStreamOptions } from '@fixtures/unifiedReports/deterministicAmounts'

// The story business id is not a UUID, so reports return a fixed one instead of echoing the path param.
export const MOCK_REPORT_BUSINESS_ID = '00000000-0000-4000-8000-000000000201'

export const rowHeaderColumn = (columnKey: string, displayName: string): UnifiedReportColumn => ({
  columnKey,
  displayName,
  isRowHeader: true,
  alignment: Alignment.Left,
  pinning: Pinning.Left,
})

export const textColumn = (columnKey: string, displayName: string): UnifiedReportColumn => ({
  columnKey,
  displayName,
  alignment: Alignment.Left,
})

export const numericColumn = (
  columnKey: string,
  displayName: string,
  pinning?: Pinning,
): UnifiedReportColumn => ({
  columnKey,
  displayName,
  alignment: Alignment.Right,
  ...(pinning && { pinning }),
})

type CellOptions = {
  bold?: boolean
  reportConfig?: ReportConfig
}

const withOptions = (
  value: UnifiedReportCell['value'],
  { bold, reportConfig }: CellOptions = {},
): UnifiedReportCell => ({
  value,
  ...(bold && { format: { bold } }),
  reportConfig: reportConfig ?? null,
})

export const currencyCell = (cents: number, options?: CellOptions) =>
  withOptions({ type: 'Currency', value: cents }, options)

export const dateCell = (date: Date, options?: CellOptions) =>
  withOptions({ type: 'Date', value: date }, options)

export const decimalCell = (value: number, options?: CellOptions) =>
  withOptions({ type: 'Decimal', value }, options)

export const durationCell = (minutes: number, options?: CellOptions) =>
  withOptions({ type: 'Duration', value: minutes }, options)

export const textCell = (value: string, options?: CellOptions) =>
  withOptions({ type: 'Text', value }, options)

export const emptyCell = (options?: CellOptions) => withOptions({ type: 'Empty' }, options)

export const linesReportConfig = (
  linesRoute: string,
  account: SingleChartAccountType,
  controls: readonly ReportControl[],
  extraBaseParameters: Record<string, string> = {},
): ReportConfig => ({
  key: `${linesRoute}:${account.accountId}`,
  reportRoute: linesRoute,
  displayName: account.name,
  controls,
  baseQueryParameters: { account_id: account.accountId, ...extraBaseParameters },
})

// parseISO keeps date-only strings in local time, matching how the app builds ranges.
export const parseDateParam = (value: string | null, fallback: Date) => {
  const parsed = parseISO(value ?? '')
  return isValid(parsed) ? parsed : fallback
}

export type ReportDateRange = { startDate: Date, endDate: Date }

export const parseDateRangeParams = (params: URLSearchParams, fallback: ReportDateRange): ReportDateRange => {
  const startDate = parseDateParam(params.get('start_date'), fallback.startDate)
  return {
    startDate,
    endDate: parseDateParam(params.get('end_date'), fallback.endDate),
  }
}

export const parseEffectiveDateParam = (params: URLSearchParams) =>
  parseDateParam(params.get('effective_date'), new Date())

/*
 * Reports driven by a single effective date (balance sheet, trial balance)
 * hand their drill-downs a trailing window so detail rows have data to show.
 */
export const trailingRangeFrom = (effectiveDate: Date): ReportDateRange => ({
  startDate: subMonths(effectiveDate, 11),
  endDate: effectiveDate,
})

export const entryStreamOptionsFromParams = (
  params: URLSearchParams,
  magnitude?: number,
): EntryStreamOptions => ({
  magnitude,
  cashBasis: params.get('reporting_basis') === 'CASH',
})

// Propagate reporting basis into drill-down base parameters so cash-basis detail reconciles with its parent cell.
export const reportingBasisBaseParams = (params: URLSearchParams): Record<string, string> => {
  const reportingBasis = params.get('reporting_basis')
  return reportingBasis ? { reporting_basis: reportingBasis } : {}
}

/*
 * Scales the shared amount engine per account class so mock financials look
 * plausible: revenue dominates the (more numerous) expense accounts, and
 * contra accounts stay small.
 */
export const isContraAccount = (account: SingleChartAccountType): boolean =>
  account.normality !== (
    account.accountType.value === LedgerAccountType.Asset || account.accountType.value === LedgerAccountType.Expense
      ? LedgerEntryDirection.Debit
      : LedgerEntryDirection.Credit
  )

export const accountMagnitude = (account: SingleChartAccountType): number => {
  if (isContraAccount(account)) return 0.3

  switch (account.accountType.value) {
    case LedgerAccountType.Revenue:
      return 12
    case LedgerAccountType.Expense:
      return account.accountSubtype?.value === 'COGS' ? 3 : 1
    case LedgerAccountType.Asset:
      return 4
    case LedgerAccountType.Liability:
      return 2
    case LedgerAccountType.Equity:
      return 1.5
  }
}
