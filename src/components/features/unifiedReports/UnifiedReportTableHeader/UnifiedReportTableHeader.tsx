import { type UnifiedReportNavigationVariant } from '@internal-types/features/unifiedReports/navigationVariant'
import { useDetailUnifiedReport } from '@providers/features/unifiedReports/UnifiedReportStore/UnifiedReportStoreProvider'
import { UnifiedReportBaseHeader } from '@features/unifiedReports/UnifiedReportBaseHeader/UnifiedReportBaseHeader'
import { UnifiedReportDetailHeader } from '@features/unifiedReports/UnifiedReportDetailHeader/UnifiedReportDetailHeader'

type UnifiedReportTableHeaderProps = {
  navigationVariant: UnifiedReportNavigationVariant
}

export const UnifiedReportTableHeader = ({ navigationVariant }: UnifiedReportTableHeaderProps) => {
  const { isDetailView } = useDetailUnifiedReport()

  return isDetailView
    ? <UnifiedReportDetailHeader />
    : <UnifiedReportBaseHeader navigationVariant={navigationVariant} />
}
