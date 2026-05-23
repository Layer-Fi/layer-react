import { BREAKPOINTS } from '@utils/screenSizeBreakpoints'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useBaseUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { type DefaultVariant, ResponsiveComponent } from '@ui/ResponsiveComponent/ResponsiveComponent'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'
import { UnifiedReportControls } from '@components/UnifiedReports/UnifiedReportControls'
import { UnifiedReportHeaderButtons } from '@components/UnifiedReports/UnifiedReportHeaderButtons'

import './unifiedReportBaseHeader.scss'

const resolveVariant = ({ width }: { width: number }): DefaultVariant =>
  width <= BREAKPOINTS.MOBILE ? 'Mobile' : 'Desktop'

const UnifiedReportBaseHeaderRow = ({ variant }: { variant: DefaultVariant }) => {
  const { baseReport } = useBaseUnifiedReport()
  const isMobile = variant === 'Mobile'

  return (
    <HStack
      pi='lg'
      pbs='lg'
      align='center'
      justify='space-between'
      className='Layer__UnifiedReports__BaseHeaderRow'
    >
      {!isMobile && (
        baseReport
          ? <Span size='lg' weight='bold'>{baseReport.displayName}</Span>
          : <SkeletonLoader width='192px' height='24px' />
      )}
      <UnifiedReportHeaderButtons variant={variant} />
    </HStack>
  )
}

export const UnifiedReportBaseHeader = () => {
  const { isDesktop } = useSizeClass()

  return (
    <VStack className='Layer__UnifiedReports__BaseHeader'>
      {isDesktop && (
        <ResponsiveComponent
          resolveVariant={resolveVariant}
          slots={{
            Desktop: <UnifiedReportBaseHeaderRow variant='Desktop' />,
            Mobile: <UnifiedReportBaseHeaderRow variant='Mobile' />,
          }}
        />
      )}
      <UnifiedReportControls />
    </VStack>
  )
}
