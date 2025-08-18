import { useCallback, useContext, useMemo, useState } from 'react'
import { View as ViewType } from '../../types/general'
import { ReportsStringOverrides } from '../../views/Reports/Reports'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { View } from '../View'
import { BreadcrumbItem } from '../DetailReportBreadcrumb/DetailReportBreadcrumb'
import { ProfitAndLossDetailReport } from '../ProfitAndLossDetailReport/ProfitAndLossDetailReport'

type ViewBreakpoint = ViewType | undefined

export type ProfitAndLossReportProps = {
  stringOverrides?: ReportsStringOverrides
  view?: ViewBreakpoint
} & TimeRangePickerConfig

type SelectedLineItem = {
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
}: ProfitAndLossReportProps) => {
  const { comparisonConfig } = useContext(ProfitAndLoss.ComparisonContext)
  const [selectedLineItem, setSelectedLineItem] = useState<SelectedLineItem | null>(null)

  // Memoize breadcrumb index lookup for O(1) performance
  const breadcrumbIndexMap = useMemo(() => {
    if (!selectedLineItem) return new Map<string, number>()

    return new Map(
      selectedLineItem.breadcrumbPath.map((item, index) => [item.name, index]),
    )
  }, [selectedLineItem])

  const handleLineItemClick = useCallback((lineItemName: string, breadcrumbPath?: BreadcrumbItem[]) => {
    if (!breadcrumbPath && selectedLineItem) {
      const clickedIndex = breadcrumbIndexMap.get(lineItemName)
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

  return (
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
                {view === 'desktop'
                  ? (
                    <ProfitAndLoss.CompareOptions />
                  )
                  : null}
              </>
            </HeaderCol>
            <HeaderCol>
              <ProfitAndLoss.DownloadButton
                stringOverrides={stringOverrides?.downloadButton}
                useComparisonPnl={!!comparisonConfig}
                moneyFormat={csvMoneyFormat}
                view={view}
              />
            </HeaderCol>
          </HeaderRow>
          {view !== 'desktop'
            ? (
              <HeaderRow>
                <HeaderCol>
                  <ProfitAndLoss.CompareOptions />
                </HeaderCol>
              </HeaderRow>
            )
            : null}
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
  )
}
