import { type ReactNode, useCallback, useContext, useMemo } from 'react'
import {
  getCoreRowModel,
  getExpandedRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table'

import {
  type CellRenderer,
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
import { ExpandButton } from '@components/ExpandButton/ExpandButton'

import './expandableDataTable.scss'

const INDENT_SIZE_SM = 20
const INDENT_SIZE_MD = 40

type ExpandableDataTableProps<TData> = BaseDataTableProps & {
  data: TData[] | undefined
  columnConfig: NestedColumnConfig<TData>
  getSubRows: (row: TData) => TData[] | undefined
  getRowId: (row: TData) => string
  indentSize?: 'sm' | 'md'
  /**
   * Optional content to render inside the first cell, after the expand
   * chevron and before the column's own cell content. Useful for
   * row-level adornments like an operator sign (-, +, ×).
   */
  renderFirstCellPrefix?: (row: Row<TData>) => ReactNode
}

const getRowIndentStyle = ({ depth, indentSizePx }: { depth: number, indentSizePx: number }) => ({
  paddingInlineStart: depth * indentSizePx,
})

const EMPTY_ARRAY: never[] = []

export type ExpandAwareRenderCellParams<TData> = {
  indentSize: 'sm' | 'md'
  renderFirstCellPrefix: CellRenderer<TData> | null | undefined
  firstCell: CellRenderer<TData>
}

function expandAwareRenderCell<TData>({ indentSize, renderFirstCellPrefix, firstCell }: ExpandAwareRenderCellParams<TData>): CellRenderer<TData> {
  return function Render(row: Row<TData>): ReactNode {
    const canExpand = row.getCanExpand()
    const indentSizePx = indentSize === 'sm' ? INDENT_SIZE_SM : INDENT_SIZE_MD
    const rowIndentStyle = getRowIndentStyle({ depth: row.depth, indentSizePx })
    const prefix = renderFirstCellPrefix?.(row)

    const hasPrefix = prefix !== null && prefix !== undefined && prefix !== false

    return (
      <div
        className='Layer__ExpandableDataTable__FirstCell'
        data-layer-component-element='edt-cell'
        data-is-first-cell='true'
        style={rowIndentStyle}
      >
        {!hasPrefix && (
          <div className='Layer__ExpandableDataTable__ChevronSlot'>
            {canExpand && <ExpandButton isExpanded={row.getIsExpanded()} />}
          </div>
        )}
        {hasPrefix && (
          <div className='Layer__ExpandableDataTable__PrefixSlot'>
            {prefix}
          </div>
        )}
        <div className='Layer__ExpandableDataTable__FirstCell__Content'>
          {firstCell(row)}
        </div>
      </div>
    )
  }
}

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

    const originalFirstCell = first.cell

    const firstWithChevron = {
      ...first,
      cell: expandAwareRenderCell({ indentSize, renderFirstCellPrefix, firstCell: originalFirstCell }),
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
