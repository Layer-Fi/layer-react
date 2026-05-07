import { type ReactNode, useCallback, useContext, useEffect, useMemo } from 'react'

import { type View as ViewType } from '@internal-types/general'
import { useReportsCompactHeader } from '@hooks/features/reports/useReportsCompactHeader'
import { InAppLinkProvider, type LinkingMetadata } from '@contexts/InAppLinkContext'
import { ProfitAndLossComparisonContext } from '@contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { HStack, Stack } from '@ui/Stack/Stack'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'
import { type BreadcrumbItem } from '@components/DetailReportBreadcrumb/DetailReportBreadcrumb'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { ProfitAndLossCompareOptions } from '@components/ProfitAndLossCompareOptions/ProfitAndLossCompareOptions'
import { ProfitAndLossDetailReport } from '@components/ProfitAndLossDetailReport/ProfitAndLossDetailReport'
import { ProfitAndLossDownloadButton } from '@components/ProfitAndLossDownloadButton/ProfitAndLossDownloadButton'
import { ProfitAndLossTableWithProvider } from '@components/ProfitAndLossTable/ProfitAndLossTableWithProvider'
import { ReportsMobileSelectionTrigger } from '@components/ReportsNavigation/ReportsMobileSelectionTrigger'
import { View } from '@components/View/View'
import { type ReportsStringOverrides } from '@views/Reports/Reports'
import type { TimeRangePickerConfig } from '@views/Reports/reportTypes'

type ViewBreakpoint = ViewType | undefined

export type ProfitAndLossReportProps = {
  stringOverrides?: ReportsStringOverrides
  view?: ViewBreakpoint
  renderInAppLink?: (source: LinkingMetadata) => ReactNode
  hideHeader?: boolean
} & TimeRangePickerConfig

export type SelectedLineItem = {
  lineItemName: string
  breadcrumbPath: BreadcrumbItem[]
}

export const ProfitAndLossReport = ({
  stringOverrides,
  dateSelectionMode = 'full',
  csvMoneyFormat,
  view,
  renderInAppLink,
  hideHeader,
}: ProfitAndLossReportProps) => {
  const { selectedLineItem, setSelectedLineItem, setDateSelectionMode } = useContext(ProfitAndLossContext)
  const { comparisonConfig } = useContext(ProfitAndLossComparisonContext)
  const { headerRef, isCompact } = useReportsCompactHeader()
  const isMobileView = view === 'mobile'

  useEffect(() => {
    setDateSelectionMode(dateSelectionMode)
  }, [dateSelectionMode, setDateSelectionMode])

  const breadcrumbIndexMap = useMemo(() => {
    if (!selectedLineItem) return {}

    return selectedLineItem.breadcrumbPath.reduce((acc, item, index) => {
      acc[item.name] = index
      return acc
    }, {} as Record<string, number>)
  }, [selectedLineItem])

  const handleLineItemClick = useCallback((lineItemName: string, breadcrumbPath?: BreadcrumbItem[]) => {
    if (!breadcrumbPath && selectedLineItem) {
      const clickedIndex = breadcrumbIndexMap[lineItemName]
      if (clickedIndex !== undefined) {
        breadcrumbPath = selectedLineItem.breadcrumbPath.slice(0, clickedIndex + 1)
      }
      else {
        return // Invalid breadcrumb click
      }
    }

    if (breadcrumbPath) {
      setSelectedLineItem({ lineItemName, breadcrumbPath })
    }
  }, [selectedLineItem, breadcrumbIndexMap, setSelectedLineItem])

  const handleCloseDetailReport = useCallback(() => {
    setSelectedLineItem(null)
  }, [setSelectedLineItem])

  const useComparisonPnl = !!comparisonConfig

  const header = useMemo(() => {
    if (hideHeader) return null

    return (
      <Header ref={headerRef}>
        <HeaderRow>
          <HeaderCol fluid>
            <Stack
              direction={isCompact ? 'column-reverse' : 'row'}
              align={isCompact ? undefined : 'end'}
              justify='space-between'
              gap='xs'
              pb='sm'
              fluid
            >
              <HStack gap='xs'>
                <CombinedDateRangeSelection mode={dateSelectionMode} isCompact={isCompact} />
                {view === 'desktop' && useComparisonPnl && <ProfitAndLossCompareOptions isCompact={isCompact} />}
              </HStack>
              <HStack gap='xs' justify='end' fluid={isCompact}>
                {isMobileView && <ReportsMobileSelectionTrigger />}
                <ProfitAndLossDownloadButton
                  stringOverrides={stringOverrides?.downloadButton}
                  moneyFormat={csvMoneyFormat}
                  iconOnly={isMobileView}
                />
              </HStack>
            </Stack>
          </HeaderCol>
        </HeaderRow>
        {view !== 'desktop' && useComparisonPnl
          && (
            <HeaderRow>
              <HeaderCol fluid>
                <HStack pb='sm' fluid>
                  <ProfitAndLossCompareOptions isCompact={isCompact} />
                </HStack>
              </HeaderCol>
            </HeaderRow>
          )}
      </Header>
    )
  }, [csvMoneyFormat, dateSelectionMode, headerRef, hideHeader, isCompact, isMobileView, stringOverrides?.downloadButton, useComparisonPnl, view])

  return (
    <InAppLinkProvider renderInAppLink={renderInAppLink}>
      <View type='panel' header={header}>
        {selectedLineItem
          ? (
            <ProfitAndLossDetailReport
              lineItemName={selectedLineItem.lineItemName}
              breadcrumbPath={selectedLineItem.breadcrumbPath}
              onClose={handleCloseDetailReport}
              onBreadcrumbClick={handleLineItemClick}
            />
          )
          : (
            <ProfitAndLossTableWithProvider
              asContainer={false}
              stringOverrides={stringOverrides?.profitAndLoss?.table}
              onLineItemClick={handleLineItemClick}
            />
          )}
      </View>
    </InAppLinkProvider>
  )
}
