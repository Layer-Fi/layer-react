import { Pinning } from '@internal-types/utility/table'
import { type ReportConfig } from '@schemas/unifiedReports/reportConfig'
import { type UnifiedReport, type UnifiedReportColumn, type UnifiedReportRow } from '@schemas/unifiedReports/unifiedReport'

import {
  currencyCell,
  headerColumn,
  textCell,
  unifiedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

// The nested shape shared by the backend's tree reports: P&L, balance sheet, cashflow.
export type ReportLineItem = {
  name: string
  displayName: string
  amounts: Record<string, number>
  reportConfig?: ReportConfig
  childItems?: readonly ReportLineItem[]
}

const lineItemRow = (item: ReportLineItem, isTopLevel: boolean): UnifiedReportRow => ({
  rowKey: item.name,
  cells: {
    account: textCell(item.displayName, { bold: isTopLevel }),
    ...Object.fromEntries(Object.entries(item.amounts).map(([columnKey, amount]) => [
      columnKey,
      currencyCell(amount, { bold: isTopLevel, reportConfig: item.reportConfig }),
    ])),
  },
  ...(item.childItems?.length
    ? { rows: item.childItems.map(child => lineItemRow(child, false)) }
    : {}),
})

const allAmountsAreZero = (item: ReportLineItem) =>
  Object.values(item.amounts).every(amount => amount === 0)

// The backend keeps an all-zero row only at the top level or when a descendant has activity.
const withoutZeroRows = (
  items: readonly ReportLineItem[],
  isTopLevel: boolean,
): ReportLineItem[] => items.flatMap((item) => {
  const childItems = withoutZeroRows(item.childItems ?? [], false)
  if (!isTopLevel && allAmountsAreZero(item) && childItems.length === 0) return []

  return [{ ...item, childItems }]
})

export const lineItemTreeReport = (
  dataColumns: UnifiedReportColumn[],
  items: readonly ReportLineItem[],
): UnifiedReport => unifiedReport(
  [headerColumn('account', { isRowHeader: true, pinning: Pinning.Left }), ...dataColumns],
  withoutZeroRows(items, true).map(item => lineItemRow(item, true)),
)
