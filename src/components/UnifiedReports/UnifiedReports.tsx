import { useTranslation } from 'react-i18next'

import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import type { DateSelectionMode } from '@providers/DateStoreProvider/GlobalDateStoreProvider'
import { UnifiedReportStoreProvider } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { ExpandableDataTableProvider } from '@components/ExpandableDataTable/ExpandableDataTableProvider'
import { ReportsNavigationSidebar } from '@components/ReportsNavigation/ReportsNavigationSidebar'
import { UnifiedReportTable } from '@components/UnifiedReports/UnifiedReportTable'
import { UnifiedReportTableHeader } from '@components/UnifiedReports/UnifiedReportTableHeader'
import { View } from '@components/View/View'

import './unifiedReports.scss'

export type UnifiedReportNavigationVariant = 'sidebar' | 'menu'

type UnifiedReportProps = {
  dateSelectionMode?: DateSelectionMode
  navigationVariant?: UnifiedReportNavigationVariant
  showTitle?: boolean
}

const UnifiedReportContent = ({
  navigationVariant = 'sidebar',
  showTitle = true,
}: Pick<UnifiedReportProps, 'navigationVariant' | 'showTitle'>) => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()

  return (
    <View title={t('reports:label.reports', 'Reports')} showHeader={showTitle} viewClassName='Layer__UnifiedReports'>
      <HStack className='Layer__UnifiedReports__Body'>
        {isDesktop && navigationVariant === 'sidebar' && (
          <VStack className='Layer__UnifiedReports__Sidebar'>
            <ReportsNavigationSidebar />
          </VStack>
        )}
        <VStack fluid className='Layer__UnifiedReports__Content'>
          <UnifiedReportTableHeader navigationVariant={navigationVariant} />
          <UnifiedReportTable />
        </VStack>
      </HStack>
    </View>
  )
}

export const UnifiedReports = ({ dateSelectionMode, navigationVariant, showTitle = true }: UnifiedReportProps) => {
  return (
    <UnifiedReportStoreProvider dateSelectionMode={dateSelectionMode}>
      <ExpandableDataTableProvider>
        <UnifiedReportContent navigationVariant={navigationVariant} showTitle={showTitle} />
      </ExpandableDataTableProvider>
    </UnifiedReportStoreProvider>
  )
}
