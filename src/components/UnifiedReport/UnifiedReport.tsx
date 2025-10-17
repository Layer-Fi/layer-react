import { Container } from '../Container'
import { UnifiedReportTable } from './UnifiedReportTable'
import { UnifiedReportTableHeader } from './UnifiedReportTableHeader'
import { ExpandableDataTableProvider } from '../ExpandableDataTable/ExpandableDataTableProvider'
import { UnifiedReportRouteStoreProvider } from '../../providers/UnifiedReportRouteStore/UnifiedReportRouteStoreProvider'

export const UnifiedReport = () => {
  return (
    <Container name='UnifiedReport'>
      <UnifiedReportRouteStoreProvider>
        <ExpandableDataTableProvider>
          <UnifiedReportTableHeader />
          <UnifiedReportTable />
        </ExpandableDataTableProvider>
      </UnifiedReportRouteStoreProvider>
    </Container>
  )
}
