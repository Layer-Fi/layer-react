import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { UnifiedReportStoreProvider } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { useSizeClass } from '@providers/WindowSizeStore/WindowSizeStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { ExpandableDataTableProvider } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { ReportsNavigation } from '@components/ReportsNavigation/ReportsNavigation'
import { UnifiedReportHeaderButtons } from '@components/UnifiedReports/UnifiedReportHeaderButtons'
import { UnifiedReportTable } from '@components/UnifiedReports/UnifiedReportTable'
import { UnifiedReportTableHeader } from '@components/UnifiedReports/UnifiedReportTableHeader'
import { View } from '@components/View/View'

import './unifiedReports.scss'

type UnifiedReportProps = {
  dateSelectionMode?: DateSelectionMode
}

const UnifiedReportContent = () => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()

  const header = useMemo(() => {
    if (isDesktop) return null

    return <UnifiedReportHeaderButtons />
  }, [isDesktop])

  return (
    <View title={t('reports:label.reports', 'Reports')} viewClassName='Layer__UnifiedReports' header={header}>
      <HStack className='Layer__UnifiedReports__Body'>
        {isDesktop && (
          <VStack className='Layer__UnifiedReports__Sidebar'>
            <ReportsNavigation />
          </VStack>
        )}
        <VStack fluid className='Layer__UnifiedReports__Content'>
          <UnifiedReportTableHeader />
          <UnifiedReportTable />
        </VStack>
      </HStack>
    </View>
  )
}

export const UnifiedReports = ({ dateSelectionMode }: UnifiedReportProps) => {
  return (
    <UnifiedReportStoreProvider dateSelectionMode={dateSelectionMode}>
      <ExpandableDataTableProvider>
        <UnifiedReportContent />
      </ExpandableDataTableProvider>
    </UnifiedReportStoreProvider>
  )
}
