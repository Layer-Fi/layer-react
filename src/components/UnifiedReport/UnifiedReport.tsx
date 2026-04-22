import { useTranslation } from 'react-i18next'

import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { UnifiedReportStoreProvider } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { ExpandableDataTableProvider } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { ReportsNavigation } from '@components/ReportsNavigation/ReportsNavigation'
import { UnifiedReportTable } from '@components/UnifiedReport/UnifiedReportTable'
import { UnifiedReportTableHeader } from '@components/UnifiedReport/UnifiedReportTableHeader'
import { View } from '@components/View/View'

import './unifiedReport.scss'

type UnifiedReportProps = {
  dateSelectionMode?: DateSelectionMode
}

export const UnifiedReport = ({ dateSelectionMode }: UnifiedReportProps) => {
  const { t } = useTranslation()
  return (
    <View title={t('reports:label.reports', 'Reports')} viewClassName='Layer__UnifiedReport'>
      <UnifiedReportStoreProvider dateSelectionMode={dateSelectionMode}>
        <ExpandableDataTableProvider>
          <HStack>
            <VStack className='Layer__UnifiedReport__Sidebar'>
              <ReportsNavigation />
            </VStack>
            <VStack fluid className='Layer__UnifiedReport__Content'>
              <UnifiedReportTableHeader />
              <UnifiedReportTable />
            </VStack>
          </HStack>
        </ExpandableDataTableProvider>
      </UnifiedReportStoreProvider>
    </View>
  )
}
