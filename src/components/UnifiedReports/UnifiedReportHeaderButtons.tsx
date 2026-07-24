import classNames from 'classnames'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { HStack } from '@ui/Stack/Stack'
import { ExpandableDataTableToggleButton } from '@blocks/ExpandableDataTable/ExpandableDataTableToggleButton'
import { ReportsMobileSelectionDrawer } from '@components/ReportsNavigation/ReportsMobileSelectionDrawer'
import { UnifiedReportDownloadButton } from '@components/UnifiedReports/UnifiedReportDownloadButton'
import type { DefaultVariant } from '@components/utility/ResponsiveComponent'

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
      justify={isMobile ? 'space-between' : 'end'}
      className={classNames('Layer__UnifiedReports__HeaderButtons', {
        'Layer__UnifiedReports__HeaderButtons--mobile': isMobile,
      })}
    >
      {isMobile && <ReportsMobileSelectionDrawer />}
      <HStack gap='xs'>
        <ExpandableDataTableToggleButton icon={isMobile} />
        <UnifiedReportDownloadButton icon={isMobile} />
      </HStack>
    </HStack>
  )
}
