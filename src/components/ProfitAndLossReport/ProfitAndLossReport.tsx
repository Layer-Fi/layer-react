import { HeaderRow } from '@components/Header/HeaderRow'
import { HeaderCol } from '@components/Header/HeaderCol'
import { Header } from '@components/Header/Header'
import { ReactNode, useCallback, useContext, useMemo } from 'react'
import { View as ViewType } from '@internal-types/general'
import { ReportsStringOverrides } from '@views/Reports/Reports'
import type { TimeRangePickerConfig } from '@views/Reports/reportTypes'
import { View } from '@components/View/View'
import { BreadcrumbItem } from '@components/DetailReportBreadcrumb/DetailReportBreadcrumb'
import { ProfitAndLossDetailReport } from '@components/ProfitAndLossDetailReport/ProfitAndLossDetailReport'
import { InAppLinkProvider, LinkingMetadata } from '@contexts/InAppLinkContext'
import { ProfitAndLossTableWithProvider } from '@components/ProfitAndLossTable/ProfitAndLossTableWithProvider'
import { ProfitAndLossCompareOptions } from '@components/ProfitAndLossCompareOptions/ProfitAndLossCompareOptions'
import { ProfitAndLossDownloadButton } from '@components/ProfitAndLossDownloadButton/ProfitAndLossDownloadButton'
import { ProfitAndLossComparisonContext } from '@contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'
import { ProfitAndLossContext } from '@contexts/ProfitAndLossContext/ProfitAndLossContext'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'

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
  const { selectedLineItem, setSelectedLineItem } = useContext(ProfitAndLossContext)
  const { comparisonConfig } = useContext(ProfitAndLossComparisonContext)

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
      <Header>
        <HeaderRow>
          <HeaderCol>
            <CombinedDateRangeSelection mode={dateSelectionMode} />
            {view === 'desktop' && useComparisonPnl && <ProfitAndLossCompareOptions />}
          </HeaderCol>
          <HeaderCol>
            <ProfitAndLossDownloadButton
              stringOverrides={stringOverrides?.downloadButton}
              moneyFormat={csvMoneyFormat}
            />
          </HeaderCol>
        </HeaderRow>
        {view !== 'desktop' && useComparisonPnl
          && (
            <HeaderRow>
              <HeaderCol>
                <ProfitAndLossCompareOptions />
              </HeaderCol>
            </HeaderRow>
          )}
      </Header>
    )
  }, [
    csvMoneyFormat,
    dateSelectionMode,
    hideHeader,
    stringOverrides?.downloadButton,
    useComparisonPnl,
    view,
  ])

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
