import {
  isCurrencyCellValue,
  isDateCellValue,
  isDecimalCellValue,
  isDurationCellValue,
  isEmptyCellValue,
  type UnifiedReport,
  type UnifiedReportCell,
  type UnifiedReportColumn,
  type UnifiedReportRow,
} from '@schemas/reports/unifiedReport'

import { isoDate } from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import { formatCsvCents } from '@msw/utils/csvPresignedUrl'

// Column groups nest only to build a multi-level rendered header; a CSV has one
// field per leaf column.
const leafColumns = (columns: readonly UnifiedReportColumn[]): UnifiedReportColumn[] =>
  columns.flatMap(column =>
    column.columns?.length ? leafColumns(column.columns) : [column],
  )

const formatCellValue = (cell: UnifiedReportCell | null | undefined): string => {
  if (cell == null) return ''

  const cellValue = cell.value

  if (isCurrencyCellValue(cellValue)) return formatCsvCents(cellValue.value)
  // Report dates are local midnight (`CalendarDate.toDate(getLocalTimeZone())`), so they
  // must format in the local zone; a UTC ISO slice lands a day early east of Greenwich.
  if (isDateCellValue(cellValue)) return isoDate(cellValue.value)
  if (isDecimalCellValue(cellValue)) return String(cellValue.value)
  if (isDurationCellValue(cellValue)) return String(cellValue.value)
  if (isEmptyCellValue(cellValue)) return ''

  // The open-ended cell variant carries whatever the backend sent, so only render
  // what stringifies meaningfully.
  const unknownValue: unknown = cellValue.value

  if (typeof unknownValue === 'string') return unknownValue
  if (
    typeof unknownValue === 'number'
    || typeof unknownValue === 'boolean'
    || typeof unknownValue === 'bigint'
  ) {
    return String(unknownValue)
  }
  if (typeof unknownValue === 'object' && unknownValue !== null) {
    return JSON.stringify(unknownValue) ?? ''
  }

  return ''
}

// Indent the row-header field so the flattened rows still convey the tree the
// table renders as expandable groups.
const INDENT = '  '

const rowToCsvRows = (
  row: UnifiedReportRow,
  columns: readonly UnifiedReportColumn[],
  rowHeaderColumnKey: string | undefined,
  depth: number,
): string[][] => [
  columns.map((column) => {
    const field = formatCellValue(row.cells[column.columnKey])

    return column.columnKey === rowHeaderColumnKey ? INDENT.repeat(depth) + field : field
  }),
  ...(row.rows ?? []).flatMap(child =>
    rowToCsvRows(child, columns, rowHeaderColumnKey, depth + 1),
  ),
]

export const unifiedReportToCsvRows = (report: UnifiedReport): string[][] => {
  const columns = leafColumns(report.columns)
  const rowHeaderColumnKey = columns.find(column => column.isRowHeader)?.columnKey

  return [
    columns.map(column => column.displayName),
    ...report.rows.flatMap(row => rowToCsvRows(row, columns, rowHeaderColumnKey, 0)),
  ]
}
