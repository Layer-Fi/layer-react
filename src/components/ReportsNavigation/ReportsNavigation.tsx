import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { ReportConfig, ReportGroup } from '@schemas/reports/reportConfig'
import { useReportConfig } from '@hooks/api/businesses/[business-id]/reports/config/useReportConfig'
import { useBaseUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { Span } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import {
  TreeNavigation,
  type TreeNavigationGroupConfig,
  type TreeNavigationLeafConfig,
} from '@components/TreeNavigation/TreeNavigation'
import { TreeNavigationSkeleton } from '@components/TreeNavigation/TreeNavigationSkeleton'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

const ReportsNavigationError = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.failed}
      title={t('reports:error.couldnt_load_reports', 'Failed to load reports')}
      description={t('reports:error.load_reports_navigation', 'Something went wrong while loading this navigation. Please try again.')}
      spacing
    />
  )
}

const isReportGroup = (item: ReportGroup | ReportConfig): item is ReportGroup =>
  'reports' in item

const groupConfig: TreeNavigationGroupConfig<ReportGroup, ReportConfig> = {
  getId: group => group.groupType,
  getTextValue: group => group.displayName,
  getChildren: group => group.reports,
  renderLabel: (group) => {
    return <Span ellipsis weight='bold'>{group.displayName}</Span>
  },
}

const buildLeafConfig = (onSelectLeaf: (report: ReportConfig) => void): TreeNavigationLeafConfig<ReportConfig> => ({
  getId: leaf => leaf.key,
  getTextValue: leaf => leaf.displayName,
  renderLabel: leaf => <Span ellipsis>{leaf.displayName}</Span>,
  onSelectLeaf,
})

export function ReportsNavigation() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useReportConfig()
  const { baseReport, setBaseReport } = useBaseUnifiedReport()

  const leafConfig = useMemo(() => buildLeafConfig(setBaseReport), [setBaseReport])

  return (
    <ConditionalBlock
      data={data}
      isLoading={isLoading}
      Loading={<TreeNavigationSkeleton />}
      Inactive={null}
      isError={isError}
      Error={<ReportsNavigationError />}
    >
      {({ data }) => (
        <TreeNavigation
          ariaLabel={t('reports:label.reports_navigation', 'Reports navigation')}
          items={data}
          selectedItem={baseReport?.key ?? null}
          isGroup={isReportGroup}
          groupConfig={groupConfig}
          leafConfig={leafConfig}
        />
      )}
    </ConditionalBlock>
  )
}
