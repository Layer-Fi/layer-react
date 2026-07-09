import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useDetailUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { BackButton } from '@ui/Button/BackButton'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { UnifiedReportDetailBreadcrumb } from '@components/UnifiedReports/UnifiedReportDetailBreadcrumb'
import { UnifiedReportDownloadButton } from '@components/UnifiedReports/UnifiedReportDownloadButton'

import './unifiedReportDetailHeader.scss'

export const UnifiedReportDetailHeader = () => {
  const { detailReportConfig, closeDetailReport } = useDetailUnifiedReport()
  const { isDesktop } = useSizeClass()

  if (!detailReportConfig) return null
  const { column } = detailReportConfig

  return (
    <HStack
      pb='lg'
      pi='lg'
      align='center'
      justify='space-between'
      className='Layer__UnifiedReports__DetailHeader'
    >
      <HStack gap='sm' align='center'>
        <BackButton onPress={closeDetailReport} />
        <VStack gap='3xs'>
          <UnifiedReportDetailBreadcrumb />
          <Span size='sm' variant='subtle'>{column.displayName}</Span>
        </VStack>
      </HStack>
      <UnifiedReportDownloadButton icon={!isDesktop} />
    </HStack>
  )
}
