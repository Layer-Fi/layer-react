import { type PropsWithChildren, useCallback, useMemo, useRef } from 'react'
import { flexRender, type Header, type HeaderGroup, type Row as RowType } from '@tanstack/react-table'
import classNames from 'classnames'

import { useHorizontalOverflow } from '@hooks/utils/size/useHorizontalOverflow'
import { useColumnPinningStyles } from '@hooks/utils/tables/useColumnPinningStyles'
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
} from '@ui/Table/Table'
import { DataTableHeaderSkeleton, DataTableSkeleton, DEFAULT_SKELETON_COLUMNS } from '@components/DataTable/DataTableSkeleton'
import { ConditionalList } from '@components/utility/ConditionalList'

import './dataTable.scss'

type ClickableRowProps<TData> = {
  onRowClick: (row: RowType<TData>) => void
  isRowClickable: (row: RowType<TData>) => boolean
}

export interface BaseDataTableProps {
  componentName: string
  ariaLabel: string
  isLoading: boolean
  isError: boolean
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies?: readonly any[]
}

export interface DataTableProps<TData> extends BaseDataTableProps {
  data: RowType<TData>[] | undefined
  headerGroups: HeaderGroup<TData>[]
  numColumns: number
  withClickableRow?: ClickableRowProps<TData>
}

const EMPTY_ARRAY: never[] = []
export const DataTable = <TData extends object>({
  isLoading,
  isError,
  componentName,
  ariaLabel,
  slots,
  dependencies,
  data,
  headerGroups,
  numColumns,
  withClickableRow,
}: DataTableProps<TData>) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const nonAria = headerGroups.length > 1 || numColumns === 0
  const { EmptyState, ErrorState } = slots
  const hasHorizontalOverflow = useHorizontalOverflow(scrollContainerRef, { dependencies: [data, numColumns] })
  const showLoadingFallbackHeaders = isLoading && numColumns === 0

  const { headerRef, pinningStyles } = useColumnPinningStyles(headerGroups)

  const renderHeaderColumn = useCallback((header: Header<TData, unknown>) => (
    <Column
      key={header.id}
      isRowHeader={header.column.columnDef.meta?.isRowHeader}
      className={`Layer__UI__Table-Column__${componentName}--${header.id}`}
      alignment={header.column.columnDef.meta?.alignment}
      headerTone={header.column.columnDef.meta?.headerTone}
      pinned={header.column.getIsPinned()}
      style={pinningStyles.get(header.column.id)}
      nonAria={nonAria}
      colSpan={header.colSpan}
    >
      {header.isPlaceholder
        ? null
        : (typeof header.column.columnDef.header === 'function'
          ? header.column.columnDef.header(header.getContext())
          : header.column.columnDef.header)}
    </Column>
  ), [componentName, nonAria, pinningStyles])

  const renderHeaderContent = useMemo(() => {
    if (showLoadingFallbackHeaders) {
      return <DataTableHeaderSkeleton nonAria={nonAria} numColumns={DEFAULT_SKELETON_COLUMNS} />
    }

    if (nonAria) {
      return headerGroups.map(headerGroup => (
        <Row key={headerGroup.id} nonAria={nonAria}>
          {headerGroup.headers.map(header => renderHeaderColumn(header))}
        </Row>
      ))
    }

    return headerGroups.flatMap(headerGroup => headerGroup.headers.map(header => renderHeaderColumn(header)))
  }, [showLoadingFallbackHeaders, nonAria, headerGroups, renderHeaderColumn])

  const FullWidthCellRow = useCallback(({ children }: PropsWithChildren) => (
    <Row className='Layer__DataTable__EmptyState__Row' nonAria={nonAria}>
      <Cell className='Layer__DataTable__EmptyState__Cell' colSpan={numColumns} nonAria={nonAria}>
        {children}
      </Cell>
    </Row>
  ), [nonAria, numColumns])

  return (
    <div
      ref={scrollContainerRef}
      className={classNames(
        'Layer__UI__Table-ScrollContainer',
        hasHorizontalOverflow && 'Layer__UI__Table-ScrollContainer--has-horizontal-overflow',
      )}
    >
      <Table
        key={`${componentName}-cols-${numColumns}`}
        aria-label={ariaLabel}
        className={`Layer__UI__Table__${componentName}`}
        nonAria={nonAria}
      >
        <TableHeader ref={headerRef} nonAria={nonAria}>
          {renderHeaderContent}
        </TableHeader>
        <TableBody dependencies={dependencies} nonAria={nonAria}>
          <ConditionalList
            list={data ?? EMPTY_ARRAY}
            isLoading={isLoading}
            isError={isError}
            Loading={<DataTableSkeleton numColumns={numColumns} nonAria={nonAria} />}
            Error={<FullWidthCellRow><ErrorState /></FullWidthCellRow>}
            Empty={<FullWidthCellRow><EmptyState /></FullWidthCellRow>}
          >
            {({ item: row }) => {
              const isClickable = withClickableRow?.isRowClickable(row)
              const onAction = isClickable && withClickableRow?.onRowClick
                ? () => withClickableRow.onRowClick(row)
                : undefined

              return (
                <Row
                  key={row.id}
                  depth={row.depth}
                  nonAria={nonAria}
                  onAction={onAction}
                  className={isClickable ? 'Layer__DataTable__ClickableRow' : undefined}
                >
                  {row.getVisibleCells().map(cell => (
                    <Cell
                      key={`${row.id}-${cell.id}`}
                      className={`Layer__UI__Table-Cell__${componentName}--${cell.column.id}`}
                      alignment={cell.column.columnDef.meta?.alignment}
                      pinned={cell.column.getIsPinned()}
                      style={pinningStyles.get(cell.column.id)}
                      nonAria={nonAria}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Cell>
                  ))}
                </Row>
              )
            }}
          </ConditionalList>
        </TableBody>
      </Table>
    </div>
  )
}
