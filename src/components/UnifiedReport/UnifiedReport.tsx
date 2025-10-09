import { Container } from '../Container'
import { ReportEnum } from '../../schemas/reports/unifiedReport'
import { UnifiedReportTable } from './UnifiedReportTable'
import { UnifiedReportTableHeader } from './UnifiedReportTableHeader'
import { ExpandableDataTableProvider } from '../ExpandableDataTable/ExpandableDataTableProvider'

type UnifiedReportProps = { report: ReportEnum }
export const UnifiedReport = ({ report }: UnifiedReportProps) => {
  return (
    <Container name='UnifiedReport'>
      <ExpandableDataTableProvider>
        <UnifiedReportTableHeader />
        <UnifiedReportTable report={report} />
      </ExpandableDataTableProvider>
    </Container>
  )
}
