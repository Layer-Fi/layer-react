import { type ReactNode, useCallback, useContext, useMemo } from 'react'
import {
  getCoreRowModel,
  getExpandedRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table'

import {
  getColumnDefs,
  getColumnPinning,
  isLeafColumn,
  type NestedColumnConfig,
} from '@components/DataTable/columnUtils'
import {
  type BaseDataTableProps,
  DataTable,
} from '@components/DataTable/DataTable'
import { ExpandableDataTableContext } from '@components/ExpandableDataTable/ExpandableDataTableProvider'

import './expandableDataTable.scss'

import { expandAwareRenderCell } from './utils'

export type ExpandableDataTableIndentSize = 'xs' | 'sm' | 'md'
type ExpandableDataTableProps<TData> = BaseDataTableProps & {
  data: TData[] | undefined
  columnConfig: NestedColumnConfig<TData>
  getSubRows: (row: TData) => TData[] | undefined
  getRowId: (row: TData) => string
  indentSize?: ExpandableDataTableIndentSize
  /**
   * Optional content to render inside the first cell, after the expand
   * chevron and before the column's own cell content. Useful for
   * row-level adornments like an operator sign (-, +, ×).
   */
  renderFirstCellPrefix?: (row: Row<TData>) => ReactNode
}

const EMPTY_ARRAY: never[] = []

export function ExpandableDataTable<TData extends object>({
  data,
  isLoading,
  isError,
  columnConfig,
  componentName,
  ariaLabel,
  slots,
  getSubRows,
  getRowId,
  indentSize = 'sm',
  renderFirstCellPrefix,
}: ExpandableDataTableProps<TData>) {
  const { expanded, setExpanded } = useContext(ExpandableDataTableContext)

  const wrappedColumnConfig = useMemo(() => {
    const [first, ...rest] = columnConfig
    if (!first || !isLeafColumn(first)) return columnConfig

    const cellRenderer = first.cell

    const firstWithChevron = {
      ...first,
      cell: expandAwareRenderCell({ indentSize, renderFirstCellPrefix, cellRenderer }),
    }

    return [firstWithChevron, ...rest]
  }, [columnConfig, renderFirstCellPrefix, indentSize])

  const columnDefs = getColumnDefs<TData>(wrappedColumnConfig)

  const columnPinning = useMemo(
    () => getColumnPinning(wrappedColumnConfig),
    [wrappedColumnConfig],
  )

  const table = useReactTable<TData>({
    data: data ?? EMPTY_ARRAY,
    columns: columnDefs,
    getSubRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: { expanded, columnPinning },
    onExpandedChange: setExpanded,
    autoResetPageIndex: false,
    getRowId,
  })

  const { rows } = table.getExpandedRowModel()

  const dependencies = useMemo(() => [expanded], [expanded])

  const headerGroups = table.getHeaderGroups()
  const numColumns = table.getVisibleLeafColumns().length

  const isRowClickable = useCallback((row: Row<TData>) => {
    return row.getCanExpand()
  }, [])

  const onRowClick = useCallback((row: Row<TData>) => {
    row.toggleExpanded()
  }, [])

  const withClickableRow = useMemo(() => ({
    onRowClick,
    isRowClickable,
  }), [onRowClick, isRowClickable])

  return (
    <DataTable
      ariaLabel={ariaLabel}
      numColumns={numColumns}
      data={rows}
      isLoading={isLoading}
      isError={isError}
      componentName={componentName}
      slots={slots}
      dependencies={dependencies}
      headerGroups={headerGroups}
      withClickableRow={withClickableRow}
    />
  )
}
