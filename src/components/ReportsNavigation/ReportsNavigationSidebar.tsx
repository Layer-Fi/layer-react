import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useReportConfig } from '@hooks/api/businesses/[business-id]/reports/config/useReportConfig'
import { useBaseUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { Span } from '@ui/Typography/Text'
import { TreeNavigation } from '@components/NestedNavigation/TreeNavigation/TreeNavigation'
import { TreeNavigationSkeleton } from '@components/NestedNavigation/TreeNavigation/TreeNavigationSkeleton'
import { ReportsNavigationSidebarError } from '@components/ReportsNavigation/ReportsNavigationSidebarError'
import {
  buildRecursiveReportsGroupConfig,
  buildReportsLeafConfig,
  isReportGroup,
} from '@components/ReportsNavigation/utils'
import { ConditionalBlock } from '@components/utility/ConditionalBlock'

const groupConfig = buildRecursiveReportsGroupConfig(
  group => <Span ellipsis weight='bold'>{group.displayName}</Span>,
)

const renderLeafLabel = (leaf: { displayName: string }) => (
  <Span ellipsis>{leaf.displayName}</Span>
)

export function ReportsNavigationSidebar() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useReportConfig()
  const { baseReport, setBaseReport } = useBaseUnifiedReport()

  const leafConfig = useMemo(
    () => buildReportsLeafConfig(setBaseReport, renderLeafLabel),
    [setBaseReport],
  )

  return (
    <ConditionalBlock
      data={data}
      isLoading={isLoading}
      Loading={<TreeNavigationSkeleton />}
      Inactive={null}
      isError={isError}
      Error={<ReportsNavigationSidebarError />}
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
