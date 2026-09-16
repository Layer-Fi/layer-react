import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { useDetailUnifiedReport } from '@providers/features/unifiedReports/UnifiedReportStore/UnifiedReportStoreProvider'
import { BackButton } from '@ui/Button/BackButton'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import { UnifiedReportDetailBreadcrumb } from '@features/unifiedReports/UnifiedReportDetailBreadcrumb/UnifiedReportDetailBreadcrumb'
import { UnifiedReportDownloadButton } from '@features/unifiedReports/UnifiedReportDownloadButton/UnifiedReportDownloadButton'

import './unifiedReportDetailHeader.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__UnifiedReports__DetailHeader: 'Layer__UnifiedReport__DetailHeader',
})

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
      className={legacyClassNames('Layer__UnifiedReports__DetailHeader')}
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
