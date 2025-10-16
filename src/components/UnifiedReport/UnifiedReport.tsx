import { Container } from '../Container'
import { UnifiedReportTable } from './UnifiedReportTable'
import { UnifiedReportTableHeader } from './UnifiedReportTableHeader'
import { ExpandableDataTableProvider } from '../ExpandableDataTable/ExpandableDataTableProvider'
import { UnifiedReportStoreProvider } from '../../providers/UnifiedReportStore/UnifiedReportStoreProvider'

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
