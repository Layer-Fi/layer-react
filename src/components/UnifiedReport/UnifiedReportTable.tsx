import { useCallback, useContext, useEffect, useMemo } from 'react'
import { type Row } from '@tanstack/react-table'

import { isAmountCellValue, isEmptyCellValue, type UnifiedReportColumn, type UnifiedReportRow } from '@schemas/reports/unifiedReport'
import { asMutable } from '@utils/asMutable'
import { useUnifiedReportWithDateParams } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { type ColumnNode, type GroupColumn, type LeafColumn, type NestedColumnConfig } from '@components/DataTable/columnUtils'
import { ExpandableDataTable } from '@components/ExpandableDataTable/ExpandableDataTable'
import { ExpandableDataTableContext } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { useUnifiedReport } from '@features/reports/api/useUnifiedReport'

import './unifiedReportTable.scss'

const COMPONENT_NAME = 'UnifiedReport'

const makeLeafColumn = (col: UnifiedReportColumn): LeafColumn<UnifiedReportRow> => ({
  id: col.columnKey,
  header: col.displayName,
  cell: (row: RowType) => {
    const cellValue = row.original.cells[col.columnKey]?.value

    if (!cellValue || isEmptyCellValue(cellValue)) {
      return null
    }

    if (isAmountCellValue(cellValue)) {
      return <MoneySpan ellipsis amount={cellValue.value} />
    }

    if (isEmptyCellValue(cellValue)) {
      return null
    }

    return <Span ellipsis>{String(cellValue.value)}</Span>
  },
})

type UnifiedReportColumnWithRequiredColumns = UnifiedReportColumn & Required<Pick<UnifiedReportColumn, 'columns'>>
const makeGroupColumn = (col: UnifiedReportColumnWithRequiredColumns): GroupColumn<UnifiedReportRow> => ({
  id: col.columnKey,
  header: col.displayName,
  columns: buildNestedColumnConfig(col.columns),
})

type RowType = Row<UnifiedReportRow>
const isGroupColumn = (col: UnifiedReportColumn): col is UnifiedReportColumnWithRequiredColumns =>
  col.columns !== undefined && col.columns.length > 0

const buildNestedColumnConfig = (columns: ReadonlyArray<UnifiedReportColumn>): ColumnNode<UnifiedReportRow>[] => {
  return columns.map((col): ColumnNode<UnifiedReportRow> => {
    if (isGroupColumn(col)) {
      return makeGroupColumn(col)
    }

    return makeLeafColumn(col)
  })
}

export const buildColumnConfig = (columns: ReadonlyArray<UnifiedReportColumn>): NestedColumnConfig<UnifiedReportRow> => {
  const displayNameColumn: LeafColumn<UnifiedReportRow> = {
    id: 'displayName',
    header: '',
    cell: (row: RowType) => (
      <Span weight={row.depth === 0 ? 'bold' : 'normal'} ellipsis>{row.original.displayName}</Span>
    ),
    isRowHeader: true,
  }

  return [displayNameColumn, ...buildNestedColumnConfig(columns)]
}

const getSubRows = (row: UnifiedReportRow) => row.rows ? asMutable(row.rows) : undefined

export const UnifiedReportTable = () => {
  const { report, ...dateParams } = useUnifiedReportWithDateParams()
  const { data, isLoading, isError, refetch } = useUnifiedReport({ report, ...dateParams })
  const { setExpanded } = useContext(ExpandableDataTableContext)
  const mutableRows = data?.rows ? asMutable(data.rows) : undefined

  const columnConfig = useMemo(() => data ? buildColumnConfig(data.columns) : [], [data])

  useEffect(() => {
    // Expand the top-level rows on initial data load
    if (mutableRows !== undefined) {
      setExpanded(Object.fromEntries(mutableRows.map(d => [d.rowKey, true])))
    }
  }, [mutableRows, setExpanded])

  const UnifiedReportEmptyState = useCallback(() => {
    return (
      <DataState
        status={DataStateStatus.allDone}
        title='No rows found'
        description='This report has no rows.'
        spacing
      />
    )
  }, [])

  const UnifiedReportErrorState = useCallback(() => (
    <DataState
      status={DataStateStatus.failed}
      title='We couldn’t load your report'
      description='An error occurred while loading your report. Please check your connection and try again.'
      onRefresh={() => { void refetch() }}
      spacing
    />
  ), [refetch])

  return (
    <ExpandableDataTable
      ariaLabel='Report'
      data={mutableRows}
      isLoading={data === undefined || isLoading}
      isError={isError}
      columnConfig={columnConfig}
      componentName={COMPONENT_NAME}
      slots={{
        ErrorState: UnifiedReportErrorState,
        EmptyState: UnifiedReportEmptyState,
      }}
      getSubRows={getSubRows}
      getRowId={row => row.rowKey}
    />
  )
}
