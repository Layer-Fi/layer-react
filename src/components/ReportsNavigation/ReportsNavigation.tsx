import { Landmark } from 'lucide-react'
import type { ComponentType } from 'react'

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

const ReportsNavigationError = () => (
  <DataState
    status={DataStateStatus.failed}
    title='Failed to load reports'
    description='Something went wrong while loading this navigation. Please try again.'
    spacing
  />
)

const REPORT_GROUP_ICON: Record<ReportGroupType, ComponentType<IconSvgProps>> = {
  [ReportGroupType.Accounting]: Landmark,
  [ReportGroupType.Unknown]: Folder,
}

const isReportGroup = (item: ReportGroup | ReportConfig): item is ReportGroup =>
  'reports' in item

export function ReportsNavigation() {
  const { data, isLoading, isError } = useReportConfig()
  const { report, setReport } = useActiveUnifiedReport()

  const groupConfig: TreeNavigationGroupConfig<ReportGroup, ReportConfig> = {
    getId: group => group.groupType,
    getTextValue: group => group.displayName,
    getChildren: group => group.reports,
    renderLabel: (group) => {
      const Icon = REPORT_GROUP_ICON[group.groupType]
      return (
        <HStack className='Layer__ReportsNavigation-GroupLabel' gap='sm' align='center'>
          <Icon className='Layer__ReportsNavigation-GroupIcon' strokeWidth={1.5} size={16} />
          <Span ellipsis variant='subtle' weight='bold'>{group.displayName}</Span>
        </HStack>
      )
    },
  }

  const leafConfig: TreeNavigationLeafConfig<ReportConfig> = {
    getId: leaf => leaf.key,
    getTextValue: leaf => leaf.displayName,
    renderLabel: leaf => <Span ellipsis>{leaf.displayName}</Span>,
    onAction: setReport,
  }

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
          ariaLabel='Reports navigation'
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
