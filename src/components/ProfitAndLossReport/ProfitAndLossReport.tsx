import { ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { View as ViewType } from '../../types/general'
import { ReportsStringOverrides } from '../../views/Reports/Reports'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { ProfitAndLossDetailLinesDownloadButton } from '../ProfitAndLossDetailLinesDownloadButton'
import { View } from '../View'
import { BreadcrumbItem } from '../DetailReportBreadcrumb/DetailReportBreadcrumb'
import { ProfitAndLossDetailReport } from '../ProfitAndLossDetailReport/ProfitAndLossDetailReport'
import { InAppLinkProvider, LinkingMetadata } from '../../contexts/InAppLinkContext'

type ViewBreakpoint = ViewType | undefined

export type ProfitAndLossReportProps = {
  stringOverrides?: ReportsStringOverrides
  view?: ViewBreakpoint
  renderInAppLink?: (source: LinkingMetadata) => ReactNode
} & TimeRangePickerConfig

export type SelectedLineItem = {
  lineItemName: string
  breadcrumbPath: BreadcrumbItem[]
}

export const ProfitAndLossReport = ({
  stringOverrides,
  allowedDatePickerModes,
  datePickerMode,
  defaultDatePickerMode,
  customDateRanges,
  csvMoneyFormat,
  view,
  renderInAppLink,
}: ProfitAndLossReportProps) => {
  const { comparisonConfig } = useContext(ProfitAndLoss.ComparisonContext)
  const [selectedLineItem, setSelectedLineItem] = useState<SelectedLineItem | null>(null)

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
  }, [selectedLineItem, breadcrumbIndexMap])

  const handleCloseDetailReport = useCallback(() => {
    setSelectedLineItem(null)
  }, [])

  const useComparisonPnl = !!comparisonConfig

  return (
    <InAppLinkProvider renderInAppLink={renderInAppLink}>
      <View
        type='panel'
        header={(
          <Header>
            <HeaderRow>
              <HeaderCol>
                <>
                  <ProfitAndLoss.DatePicker
                    allowedDatePickerModes={allowedDatePickerModes}
                    datePickerMode={datePickerMode}
                    defaultDatePickerMode={defaultDatePickerMode}
                    customDateRanges={customDateRanges}
                  />
                  {view === 'desktop' && useComparisonPnl && <ProfitAndLoss.CompareOptions />}
                </>
              </HeaderCol>
              <HeaderCol>
                {selectedLineItem
                  ? (
                    <ProfitAndLossDetailLinesDownloadButton
                      pnlStructureLineItemName={selectedLineItem.lineItemName}
                      iconOnly={view === 'mobile'}
                    />
                  )
                  : (
                    <ProfitAndLoss.DownloadButton
                      stringOverrides={stringOverrides?.downloadButton}
                      useComparisonPnl={useComparisonPnl}
                      moneyFormat={csvMoneyFormat}
                      view={view}
                    />
                  )}
              </HeaderCol>
            </HeaderRow>
            {view !== 'desktop' && useComparisonPnl
              && (
                <HeaderRow>
                  <HeaderCol>
                    <ProfitAndLoss.CompareOptions />
                  </HeaderCol>
                </HeaderRow>
              )}
          </Header>
        )}
      >
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
            <ProfitAndLoss.Table
              asContainer={false}
              stringOverrides={stringOverrides?.profitAndLoss?.table}
              onLineItemClick={handleLineItemClick}
            />
          )}
      </View>
    </InAppLinkProvider>
  )
}
