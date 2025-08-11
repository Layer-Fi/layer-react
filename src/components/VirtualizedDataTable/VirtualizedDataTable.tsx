import { useRef } from 'react'
import classNames from 'classnames'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Loader } from '../Loader/Loader'
import type { ColumnConfig, Column } from '../DataTable/DataTable'

const DEFAULT_ROW_HEIGHT = 52
const DEFAULT_OVERSCAN = 5
const DEFAULT_TABLE_HEIGHT = 500 // Shows ~9-10 rows at default row height

export interface VirtualizedDataTableProps<TData extends { id: string }, TColumns extends string> {
  columnConfig: ColumnConfig<TData, TColumns>
  data: TData[] | undefined
  componentName: string
  ariaLabel: string
  isLoading: boolean
  isError: boolean
  slots: {
    EmptyState: React.FC
    ErrorState: React.FC
  }
  // Virtualization-specific props
  height?: number
  rowHeight?: number
  overscan?: number
}

export const VirtualizedDataTable = <TData extends { id: string }, TColumns extends string>({
  columnConfig,
  data,
  isLoading,
  isError,
  componentName,
  ariaLabel,
  slots,
  height = DEFAULT_TABLE_HEIGHT,
  rowHeight = DEFAULT_ROW_HEIGHT,
  overscan = DEFAULT_OVERSCAN,
}: VirtualizedDataTableProps<TData, TColumns>) => {
  const columns: Column<TData, TColumns>[] = Object.values(columnConfig)
  const { EmptyState, ErrorState } = slots
  const containerRef = useRef<HTMLDivElement>(null)

  const isEmptyTable = data?.length === 0
  const hasData = data && data.length > 0

  const rowVirtualizer = useVirtualizer({
    count: hasData ? data.length : 0,
    estimateSize: () => rowHeight,
    getScrollElement: () => containerRef.current,
    overscan,
  })

  const CSS_PREFIX = 'Layer__UI__VirtualizedTable'

  // Handle loading, error, and empty states
  if (isError) {
    return (
      <div className={`${CSS_PREFIX}__state-container`} style={{ height }}>
        <ErrorState />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={`${CSS_PREFIX}__state-container`} style={{ height }}>
        <Loader />
      </div>
    )
  }

  if (isEmptyTable) {
    return (
      <div className={`${CSS_PREFIX}__state-container`} style={{ height }}>
        <EmptyState />
      </div>
    )
  }

  const virtualItems = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  return (
    <div
      className={`${CSS_PREFIX}__container`}
      ref={containerRef}
      style={{ height, overflow: 'auto' }}
      role='table'
      aria-label={ariaLabel}
    >
      <table className={classNames('Layer__table', `Layer__UI__Table__${componentName}`)}>
        <thead className={`${CSS_PREFIX}__header`}>
          <tr className={`${CSS_PREFIX}__header-row`}>
            {columns.map(col => (
              <th
                key={col.id}
                className={classNames(
                  'Layer__table-header',
                  `${CSS_PREFIX}__header-cell`,
                  `Layer__UI__Table-Column__${componentName}--${col.id}`,
                )}
                role='columnheader'
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ height: totalSize, position: 'relative' }}>
          {virtualItems.map((virtualRow) => {
            const row = data![virtualRow.index]
            return (
              <tr
                key={row.id}
                className={classNames(
                  'Layer__table-row',
                  `${CSS_PREFIX}__row`,
                )}
                data-index={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                role='row'
              >
                {columns.map(col => (
                  <td
                    key={`${row.id}-${col.id}`}
                    className={classNames(
                      'Layer__table-cell',
                      `${CSS_PREFIX}__cell`,
                      `Layer__UI__Table-Cell__${componentName}--${col.id}`,
                    )}
                    role={col.isRowHeader ? 'rowheader' : 'cell'}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
