import { useCallback, useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { asMutable } from '@utils/asMutable'
import { useUnifiedReport } from '@hooks/api/businesses/[business-id]/reports/unified/report-name/useUnifiedReport'
import { useActiveUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { ExpandableDataTable } from '@components/ExpandableDataTable/ExpandableDataTable'
import { ExpandableDataTableContext } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { buildNestedColumnConfig, getSubRows } from '@components/UnifiedReport/utils'

import './unifiedReportTable.scss'

const COMPONENT_NAME = 'UnifiedReport'

export const UnifiedReportTable = () => {
  const { t } = useTranslation()
  const { report } = useActiveUnifiedReport()
  const { data, isLoading, isError, refetch } = useUnifiedReport()
  const { setExpanded } = useContext(ExpandableDataTableContext)
  const mutableRows = data?.rows ? asMutable(data.rows) : undefined

  const columnConfig = useMemo(
    () => data ? buildNestedColumnConfig(data.columns) : [],
    [data],
  )

  useEffect(() => {
    // Expand the top-level rows on initial data load
    if (mutableRows !== undefined) {
      setExpanded(Object.fromEntries(mutableRows.map(d => [d.rowKey, true])))
    }
  }, [mutableRows, setExpanded])

  const UnifiedReportEmptyState = useCallback(() => {
    return (
      <DataState
        status={DataStateStatus.allDone}
        title={t('reports:empty.no_rows_found', 'No line items found')}
        description={t('reports:empty.report_has_no_rows', 'This report has no line items.')}
        spacing
      />
    )
  }, [t])

  const UnifiedReportErrorState = useCallback(() => (
    <DataState
      status={DataStateStatus.failed}
      title={t('reports:error.couldnt_load_report', 'We couldn’t load your report')}
      description={t('reports:error.load_report', 'An error occurred while loading your report. Please check your connection and try again.')}
      onRefresh={() => { void refetch() }}
      spacing
    />
  ), [t, refetch])

  return (
    <ExpandableDataTable
      ariaLabel={report?.displayName ?? t('reports:label.reports', 'Reports')}
      data={mutableRows}
      isLoading={data === undefined || isLoading}
      isError={isError}
      columnConfig={columnConfig}
      componentName={COMPONENT_NAME}
      slots={{
        ErrorState: UnifiedReportErrorState,
        EmptyState: UnifiedReportEmptyState,
      }}
      getSubRows={getSubRows}
      getRowId={row => row.rowKey}
    />
  )
}
