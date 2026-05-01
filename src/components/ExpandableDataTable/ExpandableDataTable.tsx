import { useCallback, useContext, useMemo } from 'react'
import {
  getCoreRowModel,
  getExpandedRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table'

import { HStack } from '@ui/Stack/Stack'
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
import { ExpandButton } from '@components/ExpandButton/ExpandButton'


const INDENT_SIZE_XS = 10
const INDENT_SIZE_SM = 20
const INDENT_SIZE_MD = 40

const CHEVRON_OFFSET_PX = 4

const getRowIndentStyle = ({ depth, canExpand, indentSizePx }: { depth: number, canExpand: boolean, indentSizePx: number }) => ({
  paddingInlineStart: depth * indentSizePx + (canExpand ? 0 : CHEVRON_OFFSET_PX),
})

export type ExpandableDataTableIndentSize = 'xs' | 'sm' | 'md'
type ExpandableDataTableProps<TData> = BaseDataTableProps & {
  data: TData[] | undefined
  columnConfig: NestedColumnConfig<TData>
  getSubRows: (row: TData) => TData[] | undefined
  getRowId: (row: TData) => string
  indentSize?: ExpandableDataTableIndentSize
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
}: ExpandableDataTableProps<TData>) {
  const { expanded, setExpanded } = useContext(ExpandableDataTableContext)

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
              <ExpandButton isExpanded={row.getIsExpanded()} />
              {cellRenderer(row)}
            </HStack>
          </div>
        )
      },
    }

    return [firstWithChevron, ...rest]
  }, [columnConfig, indentSize])

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
