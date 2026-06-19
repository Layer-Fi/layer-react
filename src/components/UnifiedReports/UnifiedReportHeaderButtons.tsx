import classNames from 'classnames'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import type { DefaultVariant } from '@ui/ResponsiveComponent/ResponsiveComponent'
import { HStack } from '@ui/Stack/Stack'
import { ExpandableDataTableToggleButton } from '@components/ExpandableDataTable/ExpandableDataTableToggleButton'
import { ReportsMobileSelectionDrawer } from '@components/ReportsNavigation/ReportsMobileSelectionDrawer'
import { UnifiedReportDownloadButton } from '@components/UnifiedReports/UnifiedReportDownloadButton'

import './unifiedReportHeaderButtons.scss'

type UnifiedReportHeaderButtonsProps = {
  variant?: DefaultVariant
}

export const UnifiedReportHeaderButtons = ({ variant }: UnifiedReportHeaderButtonsProps) => {
  const { isDesktop } = useSizeClass()
  const resolvedVariant = variant ?? (isDesktop ? 'Desktop' : 'Mobile')
  const isMobile = resolvedVariant === 'Mobile'

  return (
    <HStack
      gap='xs'
      className={classNames('Layer__UnifiedReports__HeaderButtons', {
        'Layer__UnifiedReports__HeaderButtons--mobile': isMobile,
      })}
    >
      {isMobile && <ReportsMobileSelectionDrawer />}
      <ExpandableDataTableToggleButton icon={isMobile} />
      <UnifiedReportDownloadButton icon={isMobile} />
    </HStack>
  )
}
