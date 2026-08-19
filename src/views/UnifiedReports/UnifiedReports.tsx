import { useTranslation } from 'react-i18next'

import type { UnifiedReportsInitialState } from '@internal-types/features/unifiedReports/initialState'
import type { UnifiedReportNavigationVariant } from '@internal-types/features/unifiedReports/navigationVariant'
import type { DateSelectionMode } from '@providers/global/GlobalDateStore/GlobalDateStoreProvider'
import { useSizeClass } from '@hooks/utils/size/useWindowSize'
import { UnifiedReportStoreProvider } from '@providers/features/unifiedReports/UnifiedReportStore/UnifiedReportStoreProvider'
import { HStack, VStack } from '@ui/Stack/Stack'
import { View } from '@blocks/Layout/View/View'
import { ExpandableDataTableProvider } from '@blocks/Table/ExpandableDataTable/ExpandableDataTableProvider'
import { UnifiedReportsNavigationSidebar } from '@features/unifiedReports/UnifiedReportsNavigationSidebar/UnifiedReportsNavigationSidebar'
import { UnifiedReportTable } from '@features/unifiedReports/UnifiedReportTable/UnifiedReportTable'
import { UnifiedReportTableHeader } from '@features/unifiedReports/UnifiedReportTableHeader/UnifiedReportTableHeader'

import './unifiedReports.scss'

type UnifiedReportProps = {
  dateSelectionMode?: DateSelectionMode
  navigationVariant?: UnifiedReportNavigationVariant
  showTitle?: boolean
  /** Report to land on instead of the server default; applied once, when the report configuration loads. */
  initialState?: UnifiedReportsInitialState
}

const UnifiedReportContent = ({
  navigationVariant = 'sidebar',
  showTitle = true,
}: Pick<UnifiedReportProps, 'navigationVariant' | 'showTitle'>) => {
  const { t } = useTranslation()
  const { isDesktop } = useSizeClass()

  return (
    <View title={t('views:UnifiedReports.label.reports', 'Reports')} showHeader={showTitle} viewClassName='Layer__UnifiedReports'>
      <HStack className='Layer__UnifiedReports__Body'>
        {isDesktop && navigationVariant === 'sidebar' && (
          <VStack className='Layer__UnifiedReports__Sidebar'>
            <UnifiedReportsNavigationSidebar />
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

export const UnifiedReports = ({ dateSelectionMode, navigationVariant, showTitle = true, initialState }: UnifiedReportProps) => {
  return (
    <UnifiedReportStoreProvider dateSelectionMode={dateSelectionMode} initialState={initialState}>
      <ExpandableDataTableProvider>
        <UnifiedReportContent navigationVariant={navigationVariant} showTitle={showTitle} />
      </ExpandableDataTableProvider>
    </UnifiedReportStoreProvider>
  )
}
