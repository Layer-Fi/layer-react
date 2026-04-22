import { type Row } from '@tanstack/react-table'

import { type UnifiedReportColumn, type UnifiedReportRow } from '@schemas/reports/unifiedReport'
import { asMutable } from '@utils/asMutable'
import { type ColumnNode, type GroupColumn, type LeafColumn } from '@components/DataTable/columnUtils'
import { UnifiedReportTableCellContent } from '@components/UnifiedReport/UnifiedReportTableCellContent'

type RowType = Row<UnifiedReportRow>

type UnifiedReportColumnWithRequiredColumns = UnifiedReportColumn & Required<Pick<UnifiedReportColumn, 'columns'>>

const isGroupColumn = (col: UnifiedReportColumn): col is UnifiedReportColumnWithRequiredColumns =>
  col.columns !== undefined && col.columns.length > 0

const makeBaseColumn = (col: UnifiedReportColumn) => ({
  id: col.columnKey,
  header: col.displayName,
  isRowHeader: col.isRowHeader,
  alignment: col.alignment,
})

const makeLeafColumn = (col: UnifiedReportColumn): LeafColumn<UnifiedReportRow> => ({
  ...makeBaseColumn(col),
  cell: (row: RowType) => (
    <UnifiedReportTableCellContent cell={row.original.cells[col.columnKey]} />
  ),
})

const makeGroupColumn = (col: UnifiedReportColumnWithRequiredColumns): GroupColumn<UnifiedReportRow> => ({
  ...makeBaseColumn(col),
  columns: buildNestedColumnConfig(col.columns),
})

export const buildNestedColumnConfig = (
  columns: ReadonlyArray<UnifiedReportColumn>,
): ColumnNode<UnifiedReportRow>[] => {
  return columns.map((col): ColumnNode<UnifiedReportRow> => {
    if (isGroupColumn(col)) {
      return makeGroupColumn(col)
    }

    return makeLeafColumn(col)
  })
}

export const getSubRows = (row: UnifiedReportRow) => row.rows ? asMutable(row.rows) : undefined
