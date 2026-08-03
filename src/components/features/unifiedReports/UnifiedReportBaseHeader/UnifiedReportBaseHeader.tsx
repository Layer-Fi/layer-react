import { BREAKPOINTS } from '@utils/screenSizeBreakpoints'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useBaseUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { SkeletonLoader } from '@ui/SkeletonLoader/SkeletonLoader'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { type DefaultVariant, ResponsiveComponent } from '@components/utility/ResponsiveComponent'
import { UnifiedReportControls } from '@features/unifiedReports/UnifiedReportControls/UnifiedReportControls'
import { UnifiedReportHeaderButtons } from '@features/unifiedReports/UnifiedReportHeaderButtons/UnifiedReportHeaderButtons'
import { type UnifiedReportNavigationVariant } from '@features/unifiedReports/UnifiedReports/UnifiedReports'
import { UnifiedReportsMegaMenu } from '@features/unifiedReports/UnifiedReportsMegaMenu/UnifiedReportsMegaMenu'

import './unifiedReportBaseHeader.scss'

const resolveVariant = ({ width }: { width: number }): DefaultVariant =>
  width <= BREAKPOINTS.MOBILE ? 'Mobile' : 'Desktop'

type UnifiedReportBaseHeaderRowProps = {
  variant: 'Desktop'
  navigationVariant: UnifiedReportNavigationVariant
} | {
  variant: 'Mobile'
}

const UnifiedReportBaseHeaderRow = (props: UnifiedReportBaseHeaderRowProps) => {
  const { baseReport } = useBaseUnifiedReport()
  const isMobile = props.variant === 'Mobile'

  return (
    <HStack
      pi='lg'
      pbs='lg'
      align='center'
      justify='space-between'
      className='Layer__UnifiedReports__BaseHeaderRow'
    >
      {!isMobile && (
        <HStack align='center' gap='lg'>
          {baseReport
            ? <Heading level={3} size='sm'>{baseReport.displayName}</Heading>
            : <SkeletonLoader width='192px' height='24px' />}
          {props.navigationVariant === 'menu' && <UnifiedReportsMegaMenu />}
        </HStack>
      )}
      <UnifiedReportHeaderButtons variant={props.variant} />
    </HStack>
  )
}

type UnifiedReportBaseHeaderProps = {
  navigationVariant: UnifiedReportNavigationVariant
}

export const UnifiedReportBaseHeader = ({ navigationVariant }: UnifiedReportBaseHeaderProps) => {
  const { isDesktop } = useSizeClass()

  return (
    <VStack className='Layer__UnifiedReports__BaseHeader'>
      {isDesktop && (
        <ResponsiveComponent
          resolveVariant={resolveVariant}
          slots={{
            Desktop: <UnifiedReportBaseHeaderRow variant='Desktop' navigationVariant={navigationVariant} />,
            Mobile: <UnifiedReportBaseHeaderRow variant='Mobile' />,
          }}
        />
      )}
      <UnifiedReportControls />
    </VStack>
  )
}
