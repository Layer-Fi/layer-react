import {
  type Pinning,
  type UnifiedReport,
  type UnifiedReportCell,
  type UnifiedReportRow,
} from '@schemas/reports/unifiedReport'

import {
  currencyCell,
  decimalCell,
  durationCell,
  numericColumn,
  rowHeaderColumn,
  textCell,
  unifiedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

const VALUE_CELLS = {
  currency: currencyCell,
  decimal: decimalCell,
  duration: durationCell,
} as const

export type TableValueColumn<Item> = {
  columnKey: string
  displayName: string
  value: (item: Item) => number
  cellType?: keyof typeof VALUE_CELLS
  /** Reformats the summed column total, e.g. re-rounding floats. */
  formatTotal?: (total: number) => number
  pinning?: Pinning
}

type TableReportOptions<Item> = {
  rowHeader: { columnKey: string, displayName: string, label: (item: Item) => string }
  rowKey: (item: Item) => string
  items: readonly Item[]
  valueColumns: ReadonlyArray<TableValueColumn<Item>>
  total: { rowKey: string, label: string }
}

/*
 * Flat table reports (one row per item, numeric value columns, bold total row
 * summing each column) share this generator; only tree/plug-based reports
 * (P&L, balance sheet, trial balance) build rows bespoke.
 */
export const generateTableReport = <Item>(
  { rowHeader, rowKey, items, valueColumns, total }: TableReportOptions<Item>,
): UnifiedReport => {
  const totals = valueColumns.map(() => 0)

  const rows: UnifiedReportRow[] = items.map((item) => {
    const cells: Record<string, UnifiedReportCell> = { [rowHeader.columnKey]: textCell(rowHeader.label(item)) }

    valueColumns.forEach((column, index) => {
      const amount = column.value(item)
      totals[index] += amount
      cells[column.columnKey] = VALUE_CELLS[column.cellType ?? 'currency'](amount)
    })

    return { rowKey: rowKey(item), cells }
  })

  rows.push({
    rowKey: total.rowKey,
    cells: {
      [rowHeader.columnKey]: textCell(total.label, { bold: true }),
      ...Object.fromEntries(valueColumns.map((column, index) => [
        column.columnKey,
        VALUE_CELLS[column.cellType ?? 'currency'](column.formatTotal?.(totals[index]) ?? totals[index], { bold: true }),
      ])),
    },
  })

  return unifiedReport(
    [
      rowHeaderColumn(rowHeader.columnKey, rowHeader.displayName),
      ...valueColumns.map(column => numericColumn(column.columnKey, column.displayName, column.pinning)),
    ],
    rows,
  )
}
