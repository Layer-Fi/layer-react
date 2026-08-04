import { format, subMonths } from 'date-fns'

import { Alignment, type Pinning } from '@internal-types/utility/table'
import { LedgerAccountType, LedgerEntryDirection, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'
import { type ReportConfig, type ReportControl } from '@schemas/reports/reportConfig'
import { type UnifiedReport, type UnifiedReportCell, type UnifiedReportColumn, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import { parseDateParam } from '@msw/utils/parseDateParam'
import { type EntryFlow, type EntryStreamOptions } from '@fixtures/unifiedReports/deterministicAmounts'

// The story business id is not a UUID, so reports return a fixed one instead of echoing the path param.
export const MOCK_REPORT_BUSINESS_ID = '00000000-0000-4000-8000-000000000201'

export const unifiedReport = (
  columns: UnifiedReportColumn[],
  rows: UnifiedReportRow[],
): UnifiedReport => ({ businessId: MOCK_REPORT_BUSINESS_ID, columns, rows })

// Mirrors the backend's UnifiedReportColumnHeader enum.
const COLUMN_HEADERS = {
  account: { displayName: 'Account', alignment: Alignment.Left },
  account_type: { displayName: 'Account Type', alignment: Alignment.Left },
  debit: { displayName: 'Debit', alignment: Alignment.Right },
  credit: { displayName: 'Credit', alignment: Alignment.Right },
  total: { displayName: 'Total', alignment: Alignment.Right },
  date: { displayName: 'Date', alignment: Alignment.Left },
  type: { displayName: 'Type', alignment: Alignment.Left },
  description: { displayName: 'Description', alignment: Alignment.Left },
  amount: { displayName: 'Amount', alignment: Alignment.Right },
  balance: { displayName: 'Balance', alignment: Alignment.Right },
  customer: { displayName: 'Customer', alignment: Alignment.Left },
  vendor: { displayName: 'Vendor', alignment: Alignment.Left },
  distance: { displayName: 'Distance', alignment: Alignment.Right },
  service: { displayName: 'Service', alignment: Alignment.Left },
  duration: { displayName: 'Duration', alignment: Alignment.Right },
} as const

export type ColumnHeaderKey = keyof typeof COLUMN_HEADERS

type HeaderColumnOptions = {
  columnKey?: string
  displayName?: string
  isRowHeader?: boolean
  pinning?: Pinning
}

export const headerColumn = (
  header: ColumnHeaderKey,
  { columnKey = header, displayName, isRowHeader, pinning }: HeaderColumnOptions = {},
): UnifiedReportColumn => ({
  columnKey,
  displayName: displayName ?? COLUMN_HEADERS[header].displayName,
  ...(isRowHeader && { isRowHeader }),
  alignment: COLUMN_HEADERS[header].alignment,
  ...(pinning && { pinning }),
})

export const numericColumn = (columnKey: string, displayName: string): UnifiedReportColumn => ({
  columnKey,
  displayName,
  alignment: Alignment.Right,
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

export const textCellOrEmpty = (value: string | null | undefined, options?: CellOptions) =>
  value != null ? textCell(value, options) : emptyCell()

export const counterpartyName = (
  counterparty: { companyName?: string | null, individualName?: string | null, externalId?: string | null },
) => counterparty.companyName ?? counterparty.individualName ?? counterparty.externalId ?? null

export const totalRowKey = (name: string) => `total_${name}`

export const totalRowLabel = (name: string) => `Total ${name}`

// Total and group rows carry an explicit empty cell for every column they don't fill.
export const paddedCells = (
  columnKeys: readonly string[],
  overrides: Record<string, UnifiedReportCell>,
): UnifiedReportRow['cells'] =>
  Object.fromEntries(columnKeys.map(columnKey => [columnKey, overrides[columnKey] ?? emptyCell()]))

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

export const isoDate = (date: Date) => format(date, 'yyyy-MM-dd')

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

// Effective-date reports hand drill-downs a trailing window so detail rows have data to show.
export const trailingRangeFrom = (effectiveDate: Date): ReportDateRange => ({
  startDate: subMonths(effectiveDate, 11),
  endDate: effectiveDate,
})

export const entryStreamOptionsFromParams = (
  params: URLSearchParams,
  magnitude?: number,
  flow?: EntryFlow,
): EntryStreamOptions => ({
  magnitude,
  cashBasis: params.get('reporting_basis') === 'CASH',
  flow,
})

export const accountFlow = (account: SingleChartAccountType): EntryFlow | undefined => {
  if (account.accountSubtype?.value === 'DISTRIBUTIONS') return 'moneyOut'
  if (account.accountSubtype?.value === 'CONTRIBUTIONS') return 'moneyIn'

  switch (account.accountType.value) {
    case LedgerAccountType.Revenue:
      return 'moneyIn'
    case LedgerAccountType.Expense:
      return 'moneyOut'
    default:
      return undefined
  }
}

// Propagate reporting basis into drill-down base parameters so cash-basis detail reconciles with its parent cell.
export const reportingBasisBaseParams = (params: URLSearchParams): Record<string, string> => {
  const reportingBasis = params.get('reporting_basis')
  return reportingBasis ? { reporting_basis: reportingBasis } : {}
}

// The detail route is date-range based, so bake the parent's exact window in to reconcile.
export const detailBaseParams = (range: ReportDateRange, params: URLSearchParams): Record<string, string> => ({
  start_date: isoDate(range.startDate),
  end_date: isoDate(range.endDate),
  ...reportingBasisBaseParams(params),
})

// Keeps mock financials plausible: revenue dominates the more numerous expense accounts.
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
