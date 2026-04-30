import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { HStack } from '@ui/Stack/Stack'
import { ExpandableDataTableToggleButton } from '@components/ExpandableDataTable/ExpandableDataTableToggleButton'
import { ReportsMobileSelectionDrawer } from '@components/ReportsNavigation/ReportsMobileSelectionDrawer'
import { UnifiedReportDownloadButton } from '@components/UnifiedReport/UnifiedReportDownloadButton'

import './unifiedReportHeaderButtons.scss'

export const UnifiedReportHeaderButtons = () => {
  const { isDesktop } = useSizeClass()

  return (
    <HStack gap='xs' className='Layer__UnifiedReport__HeaderButtons'>
      {!isDesktop && <ReportsMobileSelectionDrawer />}
      <ExpandableDataTableToggleButton />
      <UnifiedReportDownloadButton />
    </HStack>
  )
}
