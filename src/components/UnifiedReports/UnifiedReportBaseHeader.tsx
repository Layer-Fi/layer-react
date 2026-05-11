import { useBaseUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { useSizeClass } from '@providers/WindowSizeStore/WindowSizeStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'
import { UnifiedReportControls } from '@components/UnifiedReports/UnifiedReportControls'
import { UnifiedReportHeaderButtons } from '@components/UnifiedReports/UnifiedReportHeaderButtons'

import './unifiedReportBaseHeader.scss'

export const UnifiedReportBaseHeader = () => {
  const { baseReport } = useBaseUnifiedReport()
  const { isDesktop } = useSizeClass()

  return (
    <VStack className='Layer__UnifiedReports__BaseHeader'>
      {isDesktop && (
        <HStack pi='lg' pbs='lg' align='center' justify='space-between'>
          {baseReport
            ? <Span size='lg' weight='bold'>{baseReport.displayName}</Span>
            : <SkeletonLoader width='192px' height='24px' />}
          <UnifiedReportHeaderButtons />
        </HStack>
      )}
      <UnifiedReportControls />
    </VStack>
  )
}
