import { ReactNode, useCallback, useContext, useMemo } from 'react'
import { View as ViewType } from '../../types/general'
import { ReportsStringOverrides } from '../../views/Reports/Reports'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { View } from '../View'
import { BreadcrumbItem } from '../DetailReportBreadcrumb/DetailReportBreadcrumb'
import { ProfitAndLossDetailReport } from '../ProfitAndLossDetailReport/ProfitAndLossDetailReport'
import { InAppLinkProvider, LinkingMetadata } from '../../contexts/InAppLinkContext'
import { ProfitAndLossTable } from '../ProfitAndLossTable'
import { ProfitAndLossCompareOptions } from '../ProfitAndLossCompareOptions/ProfitAndLossCompareOptions'
import { ProfitAndLossDatePicker } from '../ProfitAndLossDatePicker/ProfitAndLossDatePicker'
import { ProfitAndLossDownloadButton } from '../ProfitAndLossDownloadButton/ProfitAndLossDownloadButton'
import { ProfitAndLossComparisonContext } from '../../contexts/ProfitAndLossComparisonContext/ProfitAndLossComparisonContext'
import { ProfitAndLossContext } from '../../contexts/ProfitAndLossContext/ProfitAndLossContext'

type ViewBreakpoint = ViewType | undefined

export type ProfitAndLossReportProps = {
  stringOverrides?: ReportsStringOverrides
  view?: ViewBreakpoint
  renderInAppLink?: (source: LinkingMetadata) => ReactNode
  showHeader?: boolean
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
  showHeader = true,
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

  const header = useMemo(() => (
    <Header>
      <HeaderRow>
        <HeaderCol>
          <ProfitAndLossDatePicker
            allowedDatePickerModes={allowedDatePickerModes}
            datePickerMode={datePickerMode}
            defaultDatePickerMode={defaultDatePickerMode}
            customDateRanges={customDateRanges}
          />
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
  ), [allowedDatePickerModes, csvMoneyFormat, customDateRanges, datePickerMode, defaultDatePickerMode, stringOverrides?.downloadButton, useComparisonPnl, view])

  return (
    <InAppLinkProvider renderInAppLink={renderInAppLink}>
      <View type='panel' header={showHeader && header}>
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
            <ProfitAndLossTable
              asContainer={false}
              stringOverrides={stringOverrides?.profitAndLoss?.table}
              onLineItemClick={handleLineItemClick}
            />
          )}
      </View>
    </InAppLinkProvider>
  )
}
