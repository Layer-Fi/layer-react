import { Container } from '@components/Container/Container'
import { UnifiedReportTable } from '@components/UnifiedReport/UnifiedReportTable'
import { UnifiedReportTableHeader } from '@components/UnifiedReport/UnifiedReportTableHeader'
import { ExpandableDataTableProvider } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { UnifiedReportStoreProvider } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import './unifiedReport.scss'

export const UnifiedReport = () => {
  return (
    <Container name='UnifiedReport'>
      <UnifiedReportStoreProvider>
        <ExpandableDataTableProvider>
          <UnifiedReportTableHeader />
          <UnifiedReportTable />
        </ExpandableDataTableProvider>
      </UnifiedReportStoreProvider>
    </Container>
  )
}
