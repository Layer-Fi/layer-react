import { useCallback, useContext, useEffect } from 'react'
import type { Row } from '@tanstack/react-table'

import type { LineItemWithId } from '@schemas/common/lineItem'
import { asMutable } from '@utils/asMutable'
import { useUnifiedReportWithDateParams } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { MoneySpan } from '@ui/Typography/MoneySpan'
import { Span } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import type { ColumnConfig } from '@components/DataTable/DataTable'
import { ExpandableDataTable } from '@components/ExpandableDataTable/ExpandableDataTable'
import { ExpandableDataTableContext } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { useUnifiedReport } from '@features/reports/api/useUnifiedReport'

import './unifiedReportTable.scss'

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
  const { report, ...dateParams } = useUnifiedReportWithDateParams()
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
