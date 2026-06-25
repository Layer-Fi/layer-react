import { Fragment, type MouseEvent, type PropsWithChildren, useCallback, useMemo, useRef } from 'react'
import { flexRender, type Header, type HeaderGroup, type Row as RowType } from '@tanstack/react-table'
import classNames from 'classnames'

import { useHorizontalOverflow } from '@hooks/utils/size/useHorizontalOverflow'
import { useColumnPinningStyles } from '@hooks/utils/tables/useColumnPinningStyles'
import { AnimatedPresenceElement } from '@ui/AnimatedPresenceElement/AnimatedPresenceElement'
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

export type ClickableRowProps<TData> = {
  onRowClick: (row: RowType<TData>) => void
  isRowClickable: (row: RowType<TData>) => boolean
}

export interface BaseDataTableProps {
  componentName: string
  ariaLabel: string
  isLoading: boolean
  isError: boolean
  className?: string
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
  isRowSelected?: (row: RowType<TData>) => boolean
  getRowClassName?: (row: RowType<TData>, index: number) => string | undefined
  renderExpandedRow?: (row: RowType<TData>) => React.ReactNode
}

const EMPTY_ARRAY: never[] = []

export const DataTable = <TData extends object>({
  isLoading,
  isError,
  componentName,
  ariaLabel,
  className,
  slots,
  dependencies,
  data,
  headerGroups,
  numColumns,
  withClickableRow,
  isRowSelected,
  getRowClassName,
  renderExpandedRow,
}: DataTableProps<TData>) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const nonAria = !!renderExpandedRow || headerGroups.length > 1 || numColumns === 0
  const { EmptyState, ErrorState } = slots
  const hasHorizontalOverflow = useHorizontalOverflow(scrollContainerRef, { dependencies: [data, numColumns] })
  const showLoadingFallbackHeaders = isLoading && numColumns === 0
  const isShowingFallbackRows = isLoading || isError || (data?.length ?? 0) === 0

  const { headerRef, pinningStyles } = useColumnPinningStyles(headerGroups, { isEnabled: !isShowingFallbackRows })
  const getEffectivePinnedSide = useCallback(
    (pinned: false | 'left' | 'right') => isShowingFallbackRows ? false : pinned,
    [isShowingFallbackRows],
  )

  const renderHeaderColumn = useCallback((header: Header<TData, unknown>) => (
    <Column
      key={header.id}
      isRowHeader={header.column.columnDef.meta?.isRowHeader}
      className={`Layer__UI__Table-Column__${componentName}--${header.id}`}
      alignment={header.column.columnDef.meta?.alignment}
      pinned={getEffectivePinnedSide(header.column.getIsPinned())}
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
  ), [componentName, getEffectivePinnedSide, nonAria, pinningStyles])

  const renderHeaderContent = useMemo(() => {
    if (showLoadingFallbackHeaders) {
      return <DataTableHeaderSkeleton nonAria={nonAria} numColumns={DEFAULT_SKELETON_COLUMNS} />
    }

    if (nonAria) {
      return headerGroups.map(headerGroup => (
        <Row key={headerGroup.id} nonAria={nonAria} dependencies={dependencies}>
          {headerGroup.headers.map(header => renderHeaderColumn(header))}
        </Row>
      ))
    }

    return headerGroups.flatMap(headerGroup => headerGroup.headers.map(header => renderHeaderColumn(header)))
  }, [showLoadingFallbackHeaders, nonAria, headerGroups, renderHeaderColumn, dependencies])

  const FullWidthCellRow = useCallback(({ children }: PropsWithChildren) => (
    <Row className='Layer__DataTable__EmptyState__Row' nonAria={nonAria}>
      <Cell className='Layer__DataTable__EmptyState__Cell' colSpan={numColumns} nonAria={nonAria}>
        {children}
      </Cell>
    </Row>
  ), [nonAria, numColumns])

  const stopRowAction = useCallback((event: MouseEvent) => {
    event.stopPropagation()
  }, [])

  return (
    <div
      ref={scrollContainerRef}
      className={classNames(
        'Layer__UI__Table-ScrollContainer',
        hasHorizontalOverflow && !isShowingFallbackRows && 'Layer__UI__Table-ScrollContainer--has-horizontal-overflow',
      )}
    >
      <Table
        key={`${componentName}-cols-${numColumns}`}
        aria-label={ariaLabel}
        className={classNames(
          `Layer__UI__Table__${componentName}`,
          `Layer__UI__Table__${componentName}--${numColumns}Columns`,
          isShowingFallbackRows && `Layer__UI__Table__${componentName}--fallbackRows`,
          className,
        )}
        nonAria={nonAria}
      >
        <TableHeader ref={headerRef} nonAria={nonAria} dependencies={dependencies}>
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
            {({ item: row, index }) => {
              const isClickable = withClickableRow?.isRowClickable(row)
              const onAction = isClickable && withClickableRow?.onRowClick
                ? () => withClickableRow.onRowClick(row)
                : undefined

              return (
                <Fragment key={row.id}>
                  <Row
                    depth={row.depth}
                    nonAria={nonAria}
                    onAction={onAction}
                    className={classNames(
                      isClickable && 'Layer__DataTable__ClickableRow',
                      isRowSelected?.(row) && 'Layer__DataTable__SelectedRow',
                      getRowClassName?.(row, index),
                    )}
                  >
                    {row.getVisibleCells().map(cell => (
                      <Cell
                        key={`${row.id}-${cell.id}`}
                        className={`Layer__UI__Table-Cell__${componentName}--${cell.column.id}`}
                        alignment={cell.column.columnDef.meta?.alignment}
                        pinned={getEffectivePinnedSide(cell.column.getIsPinned())}
                        style={pinningStyles.get(cell.column.id)}
                        nonAria={nonAria}
                        onClick={cell.column.columnDef.meta?.preventRowClick ? stopRowAction : undefined}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Cell>
                    ))}
                  </Row>
                  {renderExpandedRow && row.getCanExpand() && (
                    <Row className='Layer__DataTable__ExpandedRow' nonAria={nonAria}>
                      <Cell
                        colSpan={numColumns}
                        nonAria={nonAria}
                        className={classNames(
                          'Layer__DataTable__ExpandedRowCell',
                          row.getIsExpanded() && 'Layer__DataTable__ExpandedRowCell--expanded',
                        )}
                      >
                        <AnimatedPresenceElement
                          variant='expand'
                          isPresent={row.getIsExpanded()}
                          motionKey={`${row.id}--expanded`}
                          className='Layer__DataTable__ExpandedRowAnimation'
                        >
                          {renderExpandedRow(row)}
                        </AnimatedPresenceElement>
                      </Cell>
                    </Row>
                  )}
                </Fragment>
              )
            }}
          </ConditionalList>
        </TableBody>
      </Table>
    </div>
  )
}
