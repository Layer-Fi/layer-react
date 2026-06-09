import { useCallback, useContext, useMemo } from 'react'
import {
  getCoreRowModel,
  getExpandedRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table'
import { Button as ReactAriaButton } from 'react-aria-components/Button'

import { HStack } from '@ui/Stack/Stack'
import {
  getColumnDefs,
  getColumnPinning,
  isLeafColumn,
  type NestedColumnConfig,
} from '@components/DataTable/columnUtils'
import {
  type BaseDataTableProps,
  type ClickableRowProps,
  DataTable,
} from '@components/DataTable/DataTable'
import { ExpandableDataTableContext } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { ExpandButton } from '@components/ExpandButton/ExpandButton'

import './expandableDataTable.scss'

const INDENT_SIZE_XS = 10
const INDENT_SIZE_SM = 20
const INDENT_SIZE_MD = 40

const CHEVRON_OFFSET_PX = 4

const getRowIndentStyle = ({ depth, canExpand, indentSizePx }: { depth: number, canExpand: boolean, indentSizePx: number }) => ({
  paddingInlineStart: depth * indentSizePx + (canExpand ? 0 : CHEVRON_OFFSET_PX),
  overflow: 'hidden',
})

export type ExpandableDataTableIndentSize = 'xs' | 'sm' | 'md'
type ExpandableDataTableProps<TData> = BaseDataTableProps & {
  data: TData[] | undefined
  columnConfig: NestedColumnConfig<TData>
  getSubRows: (row: TData) => TData[] | undefined
  getRowId: (row: TData) => string
  indentSize?: ExpandableDataTableIndentSize
  onRowExpandToggle?: (params: { rowKey: string, expanded: boolean }) => void
  withClickableRow?: ClickableRowProps<TData>
  isRowSelected?: (row: Row<TData>) => boolean
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
  onRowExpandToggle,
  withClickableRow: withClickableRowOverride,
  isRowSelected,
}: ExpandableDataTableProps<TData>) {
  const { expanded, setExpanded } = useContext(ExpandableDataTableContext)

  const toggleRowExpanded = useCallback((row: Row<TData>) => {
    onRowExpandToggle?.({ rowKey: row.id, expanded: !row.getIsExpanded() })
    row.toggleExpanded()
  }, [onRowExpandToggle])

  const wrappedColumnConfig = useMemo(() => {
    const indentSizePx = indentSize === 'xs' ? INDENT_SIZE_XS : indentSize === 'md' ? INDENT_SIZE_MD : INDENT_SIZE_SM
    const [first, ...rest] = columnConfig
    if (!first || !isLeafColumn(first)) return columnConfig

    const cellRenderer = first.cell

    const firstWithChevron = {
      ...first,
      cell: (row: Row<TData>) => {
        const canExpand = row.getCanExpand()
        const rowIndentStyle = getRowIndentStyle({ canExpand, depth: row.depth, indentSizePx })

        if (!canExpand) return <div style={rowIndentStyle}>{cellRenderer(row)}</div>

        return (
          <div style={rowIndentStyle}>
            <HStack align='center' gap='xs'>
              <ReactAriaButton
                className='Layer__ExpandableDataTable__ExpandToggle'
                aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
                onPress={() => toggleRowExpanded(row)}
              >
                <ExpandButton isExpanded={row.getIsExpanded()} />
              </ReactAriaButton>
              {cellRenderer(row)}
            </HStack>
          </div>
        )
      },
    }

    return [firstWithChevron, ...rest]
  }, [columnConfig, indentSize, toggleRowExpanded])

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

  const dependencies = useMemo(() => [expanded, isRowSelected], [expanded, isRowSelected])

  const headerGroups = table.getHeaderGroups()
  const numColumns = table.getVisibleLeafColumns().length

  const isRowClickable = useCallback((row: Row<TData>) => {
    return row.getCanExpand()
  }, [])

  const onRowClick = useCallback((row: Row<TData>) => {
    toggleRowExpanded(row)
  }, [toggleRowExpanded])

  const defaultClickableRow = useMemo<ClickableRowProps<TData>>(() => ({
    onRowClick,
    isRowClickable,
  }), [onRowClick, isRowClickable])

  const withClickableRow = withClickableRowOverride ?? defaultClickableRow

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
      isRowSelected={isRowSelected}
    />
  )
}
