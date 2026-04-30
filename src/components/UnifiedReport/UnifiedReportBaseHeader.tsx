import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useBaseUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'
import { UnifiedReportControls } from '@components/UnifiedReport/UnifiedReportControls'
import { UnifiedReportHeaderButtons } from '@components/UnifiedReport/UnifiedReportHeaderButtons'

export const UnifiedReportBaseHeader = () => {
  const { baseReport } = useBaseUnifiedReport()
  const { isDesktop } = useSizeClass()

  return (
    <VStack>
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
