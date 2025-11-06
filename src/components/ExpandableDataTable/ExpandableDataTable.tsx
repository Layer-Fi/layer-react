import { useContext, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  getExpandedRowModel,
  type Row,
} from '@tanstack/react-table'
import { DataTable, type Column, type ColumnConfig, type DataTableProps } from '@components/DataTable/DataTable'
import { HStack } from '@ui/Stack/Stack'
import { ExpandButton } from '@components/ExpandButton/ExpandButton'
import { ExpandableDataTableContext } from '@components/ExpandableDataTable/ExpandableDataTableProvider'

type ExpandableDataTableProps<TData, TColumns extends string> = Omit<DataTableProps<TData, TColumns>, 'columnConfig'> & {
  columnConfig: ColumnConfig<Row<TData>, TColumns>
  getSubRows: (row: TData) => TData[] | undefined
}

const getRowIndentStyle = (
  { depth, canExpand }: { depth: number, canExpand: boolean },
) => ({
  paddingInlineStart: depth * 20 + (canExpand ? 0 : 4),
})

const EMPTY_ARRAY: never[] = []
export function ExpandableDataTable<TData extends { id: string }, TColumns extends string>({
  data,
  isLoading,
  isError,
  columnConfig,
  componentName,
  ariaLabel,
  slots,
  hideHeader,
  getSubRows,
}: ExpandableDataTableProps<TData, TColumns>) {
  const columnHelper = createColumnHelper<TData>()
  const columns: Column<Row<TData>, TColumns>[] = Object.values(columnConfig)
  const { expanded, setExpanded } = useContext(ExpandableDataTableContext)

  const columnDefs = columns.map((col) => {
    return columnHelper.display({
      id: col.id,
      header: () => col.header,
      cell: ({ row }) => col.cell(row),
    })
  })

  const table = useReactTable<TData>({
    data: data ?? EMPTY_ARRAY,
    columns: columnDefs,
    getSubRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    state: { expanded },
    onExpandedChange: setExpanded,
    autoResetPageIndex: false,
    getRowId: (row: TData) => row.id,
  })

  const { rows } = table.getExpandedRowModel()

  const wrappedColumnConfig = useMemo(() => {
    if (!columns.length) return columnConfig

    const [first, ...rest] = columns
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

    return {
      ...columnConfig,
      [first.id]: firstWithChevron,
      ...rest.reduce((acc, col) => {
        acc[col.id] = col
        return acc
      }, {} as Record<string, Column<Row<TData>, TColumns>>),
    }
  }, [columns, columnConfig])

  const dependencies = useMemo(() => [expanded], [expanded])

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
    />
  )
}
