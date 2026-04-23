import { useDetailUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import ChevronLeft from '@icons/ChevronLeft'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { UnifiedReportDetailBreadcrumb } from '@components/UnifiedReport/UnifiedReportDetailBreadcrumb'

import './unifiedReportDetailHeader.scss'

export const UnifiedReportDetailHeader = () => {
  const { detailReportConfig, closeDetailReport } = useDetailUnifiedReport()

  if (!detailReportConfig) return null
  const { column } = detailReportConfig

  return (
    <HStack gap='sm' pb='lg' pis='lg' align='center' className='Layer__UnifiedReport__DetailHeader'>
      <Button icon variant='outlined' onClick={closeDetailReport}>
        <ChevronLeft size={16} />
      </Button>
      <VStack gap='3xs'>
        <UnifiedReportDetailBreadcrumb />
        <Span size='sm' variant='subtle'>{column.displayName}</Span>
      </VStack>
    </HStack>
  )
}
