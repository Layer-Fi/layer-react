import { type ComponentType, useMemo } from 'react'
import { Landmark } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { ReportConfig, ReportGroup } from '@schemas/reports/reportConfig'
import { ReportGroupType } from '@schemas/reports/reportConfig'
import { useReportConfig } from '@hooks/api/businesses/[business-id]/reports/config/useReportConfig'
import { useActiveUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import Folder from '@icons/Folder'
import type { IconSvgProps } from '@icons/types'
import { HStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import {
  TreeNavigation,
  type TreeNavigationGroupConfig,
  type TreeNavigationLeafConfig,
} from '@components/TreeNavigation/TreeNavigation'
import { TreeNavigationSkeleton } from '@components/TreeNavigation/TreeNavigationSkeleton'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

import './reportsNavigation.scss'

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

const REPORT_GROUP_ICON: Record<ReportGroupType, ComponentType<IconSvgProps>> = {
  [ReportGroupType.Accounting]: Landmark,
  [ReportGroupType.Unknown]: Folder,
}

const isReportGroup = (item: ReportGroup | ReportConfig): item is ReportGroup =>
  'reports' in item

const groupConfig: TreeNavigationGroupConfig<ReportGroup, ReportConfig> = {
  getId: group => group.groupType,
  getTextValue: group => group.displayName,
  getChildren: group => group.reports,
  renderLabel: (group) => {
    const Icon = REPORT_GROUP_ICON[group.groupType]
    return (
      <HStack className='Layer__ReportsNavigation__GroupLabel' gap='sm' align='center'>
        <Icon className='Layer__ReportsNavigation__GroupIcon' strokeWidth={1.5} size={16} />
        <Span ellipsis variant='subtle' weight='bold'>{group.displayName}</Span>
      </HStack>
    )
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
  const { report, setReport } = useActiveUnifiedReport()

  const leafConfig = useMemo(() => buildLeafConfig(setReport), [setReport])

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
          selectedItem={report?.key ?? null}
          isGroup={isReportGroup}
          groupConfig={groupConfig}
          leafConfig={leafConfig}
        />
      )}
    </ConditionalBlock>
  )
}
