import { useDetailUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { UnifiedReportBaseHeader } from '@components/UnifiedReports/UnifiedReportBaseHeader'
import { UnifiedReportDetailHeader } from '@components/UnifiedReports/UnifiedReportDetailHeader'
import { type UnifiedReportNavigationVariant } from '@components/UnifiedReports/UnifiedReports'

type UnifiedReportTableHeaderProps = {
  navigationVariant: UnifiedReportNavigationVariant
}

export const UnifiedReportTableHeader = ({ navigationVariant }: UnifiedReportTableHeaderProps) => {
  const { isDetailView } = useDetailUnifiedReport()

  return isDetailView
    ? <UnifiedReportDetailHeader />
    : <UnifiedReportBaseHeader navigationVariant={navigationVariant} />
}
