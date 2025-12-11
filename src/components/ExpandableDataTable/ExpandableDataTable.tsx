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
} from '@components/DataTable/columnUtils'
import {
  DataTable,
  type DataTableProps,
} from '@components/DataTable/DataTable'
import { ExpandableDataTableContext } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { ExpandButton } from '@components/ExpandButton/ExpandButton'

type ExpandableDataTableProps<TData> = Omit<DataTableProps<TData>, 'data' | 'headerGroups'> & {
  data: TData[] | undefined
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

  const columnDefs = getColumnDefs<TData>(columnConfig)

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

  const dependencies = useMemo(() => [expanded], [expanded])

  const headerGroups = table.getHeaderGroups()

  return (
    <DataTable
      ariaLabel={ariaLabel}
      columnConfig={wrappedColumnConfig}
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
