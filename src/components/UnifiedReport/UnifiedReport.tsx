import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import type { DateSelectionMode } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { UnifiedReportStoreProvider } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { ExpandableDataTableProvider } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { ReportsNavigation } from '@components/ReportsNavigation/ReportsNavigation'
import { UnifiedReportHeaderButtons } from '@components/UnifiedReport/UnifiedReportHeaderButtons'
import { UnifiedReportTable } from '@components/UnifiedReport/UnifiedReportTable'
import { UnifiedReportTableHeader } from '@components/UnifiedReport/UnifiedReportTableHeader'
import { View } from '@components/View/View'

import './unifiedReport.scss'

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
    <View title={t('reports:label.reports', 'Reports')} viewClassName='Layer__UnifiedReport' header={header}>
      <ExpandableDataTableProvider>
        <HStack>
          {isDesktop && (
            <VStack className='Layer__UnifiedReport__Sidebar'>
              <ReportsNavigation />
            </VStack>
          )}
          <VStack fluid className='Layer__UnifiedReport__Content'>
            <UnifiedReportTableHeader />
            <UnifiedReportTable />
          </VStack>
        </HStack>
      </ExpandableDataTableProvider>
    </View>
  )
}

export const UnifiedReport = ({ dateSelectionMode }: UnifiedReportProps) => {
  return (
    <UnifiedReportStoreProvider dateSelectionMode={dateSelectionMode}>
      <UnifiedReportContent />
    </UnifiedReportStoreProvider>
  )
}
