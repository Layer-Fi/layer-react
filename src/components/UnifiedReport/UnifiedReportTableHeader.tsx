import { useDetailUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { UnifiedReportBaseHeader } from '@components/UnifiedReport/UnifiedReportBaseHeader'
import { UnifiedReportDetailHeader } from '@components/UnifiedReport/UnifiedReportDetailHeader'

export const UnifiedReportTableHeader = () => {
  const { isDetailView } = useDetailUnifiedReport()

  return isDetailView ? <UnifiedReportDetailHeader /> : <UnifiedReportBaseHeader />
}
