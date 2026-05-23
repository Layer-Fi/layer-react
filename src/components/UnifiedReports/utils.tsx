import { type Row } from '@tanstack/react-table'

import { Pinning, type UnifiedReportColumn, type UnifiedReportRow } from '@schemas/reports/unifiedReport'
import type { TagValueDefinition } from '@schemas/tag'
import { asMutable } from '@utils/asMutable'
import type { ColumnHeaderTone } from '@ui/Table/Table'
import {
  type ColumnNode,
  type ColumnPinningSide,
  type GroupColumn,
  type LeafColumn,
} from '@components/DataTable/columnUtils'
import { UnifiedReportTableCellContent } from '@components/UnifiedReports/UnifiedReportTableCellContent'

type RowType = Row<UnifiedReportRow>

type UnifiedReportColumnWithRequiredColumns = UnifiedReportColumn & Required<Pick<UnifiedReportColumn, 'columns'>>

const getCell = (row: Row<UnifiedReportRow>, col: UnifiedReportColumn) => row.original.cells[col.columnKey]

const isGroupColumn = (col: UnifiedReportColumn): col is UnifiedReportColumnWithRequiredColumns =>
  col.columns !== undefined && col.columns.length > 0

const toPinningSide = (pinning: Pinning | undefined): ColumnPinningSide | undefined => {
  switch (pinning) {
    case Pinning.Left:
      return 'left'
    case Pinning.Right:
      return 'right'
    default:
      return undefined
  }
}

const SHADED_HEADER_TONE = 'shaded' satisfies ColumnHeaderTone

const getTagColumnTones = (
  selectedTagValues: ReadonlyArray<TagValueDefinition>,
): ReadonlyMap<string, ColumnHeaderTone> => {
  return new Map(
    selectedTagValues.flatMap((tagValue, index): [string, ColumnHeaderTone][] => {
      if (index % 2 === 0) return []

      return [
        [tagValue.value, SHADED_HEADER_TONE],
        [tagValue.displayName ?? tagValue.value, SHADED_HEADER_TONE],
      ]
    }),
  )
}

const getHeaderTone = (
  col: UnifiedReportColumn,
  tagColumnTones: ReadonlyMap<string, ColumnHeaderTone>,
): ColumnHeaderTone | undefined => {
  return tagColumnTones.get(col.columnKey) ?? tagColumnTones.get(col.displayName)
}

const makeBaseColumn = (col: UnifiedReportColumn, headerTone?: ColumnHeaderTone) => ({
  id: col.columnKey,
  header: col.displayName,
  isRowHeader: col.isRowHeader,
  alignment: col.alignment,
  headerTone,
})

const makeLeafColumn = (col: UnifiedReportColumn, headerTone?: ColumnHeaderTone): LeafColumn<UnifiedReportRow> => ({
  ...makeBaseColumn(col, headerTone),
  pinning: toPinningSide(col.pinning),
  cell: (row: RowType) => {
    const cell = getCell(row, col)
    const cellConfig = cell?.reportConfig ?? null
    const breadcrumb = cellConfig ? [cellConfig] : []

    let parentRow = row.getParentRow()
    while (parentRow) {
      const parentConfig = getCell(parentRow, col)?.reportConfig
      if (!parentConfig) break

      breadcrumb.push(parentConfig)
      parentRow = parentRow.getParentRow()
    }

    return <UnifiedReportTableCellContent cell={cell} column={col} breadcrumb={breadcrumb.reverse()} />
  },
})

const buildNestedColumnConfigWithTagTones = (
  columns: ReadonlyArray<UnifiedReportColumn>,
  tagColumnTones: ReadonlyMap<string, ColumnHeaderTone>,
): ColumnNode<UnifiedReportRow>[] => {
  return columns.map((col): ColumnNode<UnifiedReportRow> => {
    if (isGroupColumn(col)) {
      return makeGroupColumn(col, tagColumnTones)
    }

    return makeLeafColumn(col, getHeaderTone(col, tagColumnTones))
  })
}

const makeGroupColumn = (
  col: UnifiedReportColumnWithRequiredColumns,
  tagColumnTones: ReadonlyMap<string, ColumnHeaderTone>,
): GroupColumn<UnifiedReportRow> => ({
  ...makeBaseColumn(col, getHeaderTone(col, tagColumnTones)),
  columns: buildNestedColumnConfigWithTagTones(col.columns, tagColumnTones),
})

export const buildNestedColumnConfig = (
  columns: ReadonlyArray<UnifiedReportColumn>,
  selectedTagValues: ReadonlyArray<TagValueDefinition> = [],
): ColumnNode<UnifiedReportRow>[] => {
  return buildNestedColumnConfigWithTagTones(columns, getTagColumnTones(selectedTagValues))
}

export const getSubRows = (row: UnifiedReportRow) => row.rows ? asMutable(row.rows) : undefined
