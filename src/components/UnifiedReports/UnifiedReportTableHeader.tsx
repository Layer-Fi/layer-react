import { useDetailUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { UnifiedReportBaseHeader } from '@components/UnifiedReports/UnifiedReportBaseHeader'
import { UnifiedReportDetailHeader } from '@components/UnifiedReports/UnifiedReportDetailHeader'

export const UnifiedReportTableHeader = () => {
  const { isDetailView } = useDetailUnifiedReport()

  return isDetailView ? <UnifiedReportDetailHeader /> : <UnifiedReportBaseHeader />
}
