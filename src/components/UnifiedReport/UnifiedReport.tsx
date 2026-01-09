import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { UnifiedReportStoreProvider } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { Container } from '@components/Container/Container'
import { ExpandableDataTableProvider } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { UnifiedReportTable } from '@components/UnifiedReport/UnifiedReportTable'
import { UnifiedReportTableHeader } from '@components/UnifiedReport/UnifiedReportTableHeader'

import './unifiedReport.scss'

type UnifiedReportProps = {
  dateSelectionMode?: DateSelectionMode
}

export const UnifiedReport = ({ dateSelectionMode = 'full' }: UnifiedReportProps) => {
  return (
    <Container name='UnifiedReport'>
      <UnifiedReportStoreProvider>
        <ExpandableDataTableProvider>
          <UnifiedReportTableHeader dateSelectionMode={dateSelectionMode} />
          <UnifiedReportTable dateSelectionMode={dateSelectionMode} />
        </ExpandableDataTableProvider>
      </UnifiedReportStoreProvider>
    </Container>
  )
}
