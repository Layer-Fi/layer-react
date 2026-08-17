import classNames from 'classnames'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import type { DefaultVariant } from '@components/utility/ResponsiveComponent'
import { HStack } from '@ui/Stack/Stack'
import { ExpandableDataTableToggleButton } from '@blocks/Table/ExpandableDataTable/ExpandableDataTableToggleButton'
import { UnifiedReportDownloadButton } from '@features/unifiedReports/UnifiedReportDownloadButton/UnifiedReportDownloadButton'
import { UnifiedReportsMobileSelectionDrawer } from '@features/unifiedReports/UnifiedReportsMobileSelectionDrawer/UnifiedReportsMobileSelectionDrawer'

import './unifiedReportHeaderButtons.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__UnifiedReports__HeaderButtons: 'Layer__UnifiedReport__HeaderButtons',
})

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
      className={classNames(legacyClassNames('Layer__UnifiedReports__HeaderButtons'), {
        'Layer__UnifiedReports__HeaderButtons--mobile': isMobile,
      })}
    >
      {isMobile && <UnifiedReportsMobileSelectionDrawer />}
      <HStack gap='xs'>
        <ExpandableDataTableToggleButton icon={isMobile} />
        <UnifiedReportDownloadButton icon={isMobile} />
      </HStack>
    </HStack>
  )
}
