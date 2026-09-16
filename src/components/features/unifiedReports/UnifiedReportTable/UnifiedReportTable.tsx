import { useCallback, useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { asMutable } from '@utils/shared/array/asMutable'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'
import { useActiveUnifiedReport } from '@providers/features/unifiedReports/UnifiedReportStore/UnifiedReportStoreProvider'
import { useUnifiedReport } from '@hooks/features/reports/useUnifiedReport'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'
import { ExpandableDataTable } from '@blocks/Table/ExpandableDataTable/ExpandableDataTable'
import { ExpandableDataTableContext } from '@blocks/Table/ExpandableDataTable/ExpandableDataTableProvider'
import { buildNestedColumnConfig, getSubRows } from '@features/unifiedReports/UnifiedReportTable/utils'

import './unifiedReportTable.scss'

const COMPONENT_NAME = 'UnifiedReports'

export const UnifiedReportTable = () => {
  const { t } = useTranslation()
  const { report } = useActiveUnifiedReport()
  const { data, isLoading, isError, refetch } = useUnifiedReport()
  const { setExpanded } = useContext(ExpandableDataTableContext)
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.UnifiedReports)
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
        title={t('unifiedReports:UnifiedReportTable.empty.no_rows_found', 'No line items found')}
        description={t('unifiedReports:UnifiedReportTable.empty.report_has_no_rows', 'This report has no line items.')}
        spacing
      />
    )
  }, [t])

  const onRowExpandToggle = useCallback(
    ({ rowKey, expanded }: { rowKey: string, expanded: boolean }) =>
      emitLayerEvent({
        type: LayerEventType.ReportsSectionExpanded,
        version: 1,
        payload: { sectionKey: rowKey, expanded },
      }),
    [emitLayerEvent],
  )

  const UnifiedReportErrorState = useCallback(() => (
    <DataState
      status={DataStateStatus.failed}
      title={t('unifiedReports:UnifiedReportTable.error.couldnt_load_report', 'We couldn’t load your report')}
      description={t('unifiedReports:UnifiedReportTable.error.load_report', 'An error occurred while loading your report. Please check your connection and try again.')}
      onRefresh={() => { void refetch() }}
      spacing
    />
  ), [t, refetch])

  return (
    <ExpandableDataTable
      ariaLabel={report?.displayName ?? t('unifiedReports:UnifiedReportTable.label.reports', 'Reports')}
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
      onRowExpandToggle={onRowExpandToggle}
    />
  )
}
