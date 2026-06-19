import { useDetailUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { BackButton } from '@ui/Button/BackButton'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { UnifiedReportDetailBreadcrumb } from '@components/UnifiedReports/UnifiedReportDetailBreadcrumb'

import './unifiedReportDetailHeader.scss'

export const UnifiedReportDetailHeader = () => {
  const { detailReportConfig, closeDetailReport } = useDetailUnifiedReport()

  if (!detailReportConfig) return null
  const { column } = detailReportConfig

  return (
    <HStack gap='sm' pb='lg' pis='lg' align='center' className='Layer__UnifiedReports__DetailHeader'>
      <BackButton onPress={closeDetailReport} />
      <VStack gap='3xs'>
        <UnifiedReportDetailBreadcrumb />
        <Span size='sm' variant='subtle'>{column.displayName}</Span>
      </VStack>
    </HStack>
  )
}
