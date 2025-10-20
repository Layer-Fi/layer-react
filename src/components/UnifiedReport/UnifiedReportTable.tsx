import { useCallback, useContext, useEffect } from 'react'
import type { ColumnConfig } from '../DataTable/DataTable'
import { Span } from '../ui/Typography/Text'
import { DataState, DataStateStatus } from '../DataState/DataState'
import type { LineItemWithId } from '../../schemas/common/lineItem'
import { ExpandableDataTable } from '../ExpandableDataTable/ExpandableDataTable'
import { MoneySpan } from '../ui/Typography/MoneySpan'
import { useUnifiedReport } from '../../features/reports/api/useUnifiedReport'
import type { Row } from '@tanstack/react-table'
import { ExpandableDataTableContext } from '../ExpandableDataTable/ExpandableDataTableProvider'
import { useUnifiedReportDateOrDateRange, useUnifiedReportRoute } from '../../providers/UnifiedReportRouteStore/UnifiedReportRouteStoreProvider'
import { asMutable } from '../../utils/asMutable'

const COMPONENT_NAME = 'UnifiedReport'

enum UnifiedReportColumns {
  DisplayName = 'DisplayName',
  Value = 'Value',
}

const COLUMN_CONFIG: ColumnConfig<Row<LineItemWithId>, UnifiedReportColumns> = ({
  [UnifiedReportColumns.DisplayName]: {
    id: UnifiedReportColumns.DisplayName,
    header: 'Line Item',
    cell: row => (
      <Span weight={row.depth === 0 ? 'bold' : 'normal'} ellipsis>{row.original.displayName}</Span>
    ),
    isRowHeader: true,
  },
  [UnifiedReportColumns.Value]: {
    id: UnifiedReportColumns.Value,
    header: 'Amount',
    cell: row => <MoneySpan amount={row.original.value} />,
  },
})

const getSubRows = (lineItem: LineItemWithId) => asMutable(lineItem.lineItems)

export const UnifiedReportTable = () => {
  const { report } = useUnifiedReportRoute()
  const dateParams = useUnifiedReportDateOrDateRange()
  const { data, isLoading, isError, refetch } = useUnifiedReport({ report, ...dateParams })
  const { setExpanded } = useContext(ExpandableDataTableContext)
  const mutableLineItems = data ? asMutable(data?.lineItems) : undefined

  useEffect(() => {
    // Expand the top-level rows on initial data load
    if (mutableLineItems !== undefined) {
      setExpanded(Object.fromEntries(mutableLineItems.map(d => [d.id, true])))
    }
  }, [mutableLineItems, setExpanded])

  const UnifiedReportEmptyState = useCallback(() => {
    return (
      <DataState
        status={DataStateStatus.allDone}
        title='No rows found'
        description='This report has no rows.'
        spacing
      />
    )
  }, [])

  const UnifiedReportErrorState = useCallback(() => (
    <DataState
      status={DataStateStatus.failed}
      title='We couldn’t load your report'
      description='An error occurred while loading your report. Please check your connection and try again.'
      onRefresh={() => { void refetch() }}
      spacing
    />
  ), [refetch])

  return (
    <ExpandableDataTable
      ariaLabel='Report'
      data={mutableLineItems}
      isLoading={data === undefined || isLoading}
      isError={isError}
      columnConfig={COLUMN_CONFIG}
      componentName={COMPONENT_NAME}
      slots={{
        ErrorState: UnifiedReportErrorState,
        EmptyState: UnifiedReportEmptyState,
      }}
      getSubRows={getSubRows}
      hideHeader
    />
  )
}
