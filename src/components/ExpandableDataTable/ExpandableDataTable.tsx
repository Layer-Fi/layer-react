import { useContext, useMemo } from 'react'
import {
  getCoreRowModel,
  getExpandedRowModel,
  type Row,
  useReactTable,
} from '@tanstack/react-table'

import { HStack } from '@ui/Stack/Stack'
import {
  getColumnDefs,
  isLeafColumn,
  type NestedColumnConfig,
} from '@components/DataTable/columnUtils'
import {
  type BaseDataTableProps,
  DataTable,
} from '@components/DataTable/DataTable'
import { ExpandableDataTableContext } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { ExpandButton } from '@components/ExpandButton/ExpandButton'

type ExpandableDataTableProps<TData> = BaseDataTableProps & {
  data: TData[] | undefined
  columnConfig: NestedColumnConfig<TData>
  getSubRows: (row: TData) => TData[] | undefined
  getRowId: (row: TData) => string
}

const getRowIndentStyle = (
  { depth, canExpand }: { depth: number, canExpand: boolean },
) => ({
  paddingInlineStart: depth * 20 + (canExpand ? 0 : 4),
})

const EMPTY_ARRAY: never[] = []
export function ExpandableDataTable<TData extends object>({
  data,
  isLoading,
  isError,
  columnConfig,
  componentName,
  ariaLabel,
  slots,
  hideHeader,
  getSubRows,
  getRowId,
}: ExpandableDataTableProps<TData>) {
  const { expanded, setExpanded } = useContext(ExpandableDataTableContext)

  const wrappedColumnConfig = useMemo(() => {
    const [first, ...rest] = columnConfig
    if (!first || !isLeafColumn(first)) return columnConfig

    const originalFirstCell = first.cell

    const firstWithChevron = {
      ...first,
      cell: (row: Row<TData>) => {
        const canExpand = row.getCanExpand()
        const rowIndentStyle = getRowIndentStyle({ canExpand, depth: row.depth })

        if (!canExpand) return <div style={rowIndentStyle}>{originalFirstCell(row)}</div>

        return (
          <div style={rowIndentStyle}>
            <HStack align='center' gap='xs'>
              <ExpandButton isExpanded={row.getIsExpanded()} onClick={row.getToggleExpandedHandler()} />
              {originalFirstCell(row)}
            </HStack>
          </div>
        )
      },
    }

    return [firstWithChevron, ...rest]
  }, [columnConfig])

  const columnDefs = getColumnDefs<TData>(wrappedColumnConfig)

  const table = useReactTable<TData>({
    data: data ?? EMPTY_ARRAY,
    columns: columnDefs,
    getSubRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: { expanded },
    onExpandedChange: setExpanded,
    autoResetPageIndex: false,
    getRowId,
  })

  const { rows } = table.getExpandedRowModel()

  const dependencies = useMemo(() => [expanded], [expanded])

  const headerGroups = table.getHeaderGroups()
  const numColumns = table.getVisibleLeafColumns().length

  return (
    <DataTable
      ariaLabel={ariaLabel}
      numColumns={numColumns}
      data={rows}
      isLoading={isLoading}
      isError={isError}
      componentName={componentName}
      slots={slots}
      hideHeader={hideHeader}
      dependencies={dependencies}
      headerGroups={headerGroups}
    />
  )
}
