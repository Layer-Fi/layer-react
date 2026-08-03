import { type ReactNode, useCallback, useContext, useEffect, useMemo } from 'react'

import { type View as ViewType } from '@internal-types/general'
import type { TimeRangePickerConfig } from '@internal-types/reports'
import { useReportsCompactHeader } from '@hooks/features/reports/useReportsCompactHeader'
import { InAppLinkProvider, type LinkingMetadata } from '@contexts/InAppLinkContext'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { Header } from '@ui/Header/Header'
import { HeaderCol } from '@ui/Header/HeaderCol'
import { HeaderRow } from '@ui/Header/HeaderRow'
import { HStack, Stack } from '@ui/Stack/Stack'
import { CombinedDateRangeSelection } from '@blocks/datePickers/DateSelection/CombinedDateRangeSelection'
import { View } from '@components/View/View'
import { ProfitAndLossDetailReport } from '@features/profitAndLoss/ProfitAndLossDetailReport/ProfitAndLossDetailReport'
import { type BreadcrumbItem } from '@features/profitAndLoss/ProfitAndLossDetailReportBreadcrumb/ProfitAndLossDetailReportBreadcrumb'
import { ProfitAndLossDownloadButton } from '@features/profitAndLoss/ProfitAndLossDownloadButton/ProfitAndLossDownloadButton'
import { type ProfitAndLossDownloadButtonStringOverrides } from '@features/profitAndLoss/ProfitAndLossDownloadButton/types'
import { type ProfitAndLossTableStringOverrides } from '@features/profitAndLoss/ProfitAndLossTable/ProfitAndLossTableComponent'
import { ProfitAndLossTableWithProvider } from '@features/profitAndLoss/ProfitAndLossTable/ProfitAndLossTableWithProvider'
import { ReportsMobileSelectionTrigger } from '@features/reports/ReportsMobileSelectionTrigger/ReportsMobileSelectionTrigger'

type ViewBreakpoint = ViewType | undefined

export interface ProfitAndLossReportStringOverrides {
  downloadButton?: ProfitAndLossDownloadButtonStringOverrides
  profitAndLoss?: {
    table?: ProfitAndLossTableStringOverrides
  }
}

export type ProfitAndLossReportProps = {
  stringOverrides?: ProfitAndLossReportStringOverrides
  view?: ViewBreakpoint
  renderInAppLink?: (source: LinkingMetadata) => ReactNode
  hideHeader?: boolean
} & TimeRangePickerConfig

export const ProfitAndLossReport = ({
  stringOverrides,
  dateSelectionMode = 'full',
  csvMoneyFormat,
  view,
  renderInAppLink,
  hideHeader,
}: ProfitAndLossReportProps) => {
  const { selectedLineItem, setSelectedLineItem, setDateSelectionMode } = useContext(ProfitAndLossContext)
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
              </HStack>
              <HStack gap='xs' justify='end' fluid={isCompact}>
                {isMobileView && <ReportsMobileSelectionTrigger />}
                <ProfitAndLossDownloadButton
                  stringOverrides={stringOverrides?.downloadButton}
                  moneyFormat={csvMoneyFormat}
                  icon={isMobileView}
                />
              </HStack>
            </Stack>
          </HeaderCol>
        </HeaderRow>
      </Header>
    )
  }, [csvMoneyFormat, dateSelectionMode, headerRef, hideHeader, isCompact, isMobileView, stringOverrides?.downloadButton])

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
