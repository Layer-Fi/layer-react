import { Pinning } from '@internal-types/utility/table'
import { type UnifiedReport, type UnifiedReportCell, type UnifiedReportRow } from '@schemas/unifiedReports/unifiedReport'

import {
  type ColumnHeaderKey,
  headerColumn,
  paddedCells,
  textCell,
  totalRowKey,
  unifiedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

export type FlatGroup<Item> = {
  rowKey: string
  label: string
  isUncategorized: boolean
  items: readonly Item[]
}

type FlatGroupedReportOptions<Item> = {
  columns: readonly ColumnHeaderKey[]
  measureColumn: ColumnHeaderKey
  items: readonly Item[]
  rowFor: (item: Item) => UnifiedReportRow
  subtotalCell: (items: readonly Item[], options: { bold: boolean }) => UnifiedReportCell
  groupsFor?: (items: readonly Item[]) => ReadonlyArray<FlatGroup<Item>>
  total: { rowKey: string, label: string }
}

export const flatGroupedReport = <Item>(
  { columns, measureColumn, items, rowFor, subtotalCell, groupsFor, total }: FlatGroupedReportOptions<Item>,
): UnifiedReport => {
  const labeledRow = (rowKey: string, label: string, groupItems: readonly Item[]): UnifiedReportRow => ({
    rowKey,
    cells: paddedCells(columns, {
      date: textCell(label, { bold: true }),
      [measureColumn]: subtotalCell(groupItems, { bold: true }),
    }),
  })

  const bodyRows = groupsFor
    ? [...groupsFor(items)]
      .sort((a, b) => Number(a.isUncategorized) - Number(b.isUncategorized)
        || a.label.toLowerCase().localeCompare(b.label.toLowerCase()))
      .map(group => ({ ...labeledRow(group.rowKey, group.label, group.items), rows: group.items.map(rowFor) }))
    : items.map(rowFor)

  return unifiedReport(
    columns.map(column => headerColumn(column, column === 'date'
      ? { isRowHeader: true, pinning: Pinning.Left }
      : {})),
    [...bodyRows, labeledRow(totalRowKey(total.rowKey), total.label, items)],
  )
}
