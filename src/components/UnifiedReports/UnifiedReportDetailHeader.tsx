import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { useDetailUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { UnifiedReportDetailBreadcrumb } from '@components/UnifiedReports/UnifiedReportDetailBreadcrumb'

import './unifiedReportDetailHeader.scss'

export const UnifiedReportDetailHeader = () => {
  const { detailReportConfig, closeDetailReport } = useDetailUnifiedReport()
  const { t } = useTranslation()

  if (!detailReportConfig) return null
  const { column } = detailReportConfig

  return (
    <HStack gap='sm' pb='lg' pis='lg' align='center' className='Layer__UnifiedReports__DetailHeader'>
      <Button icon variant='outlined' onClick={closeDetailReport} aria-label={t('common:action.back', 'Back')}>
        <ChevronLeft size={16} />
      </Button>
      <VStack gap='3xs'>
        <UnifiedReportDetailBreadcrumb />
        <Span size='sm' variant='subtle'>{column.displayName}</Span>
      </VStack>
    </HStack>
  )
}
