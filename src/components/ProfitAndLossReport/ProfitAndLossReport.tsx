import { useContext, useState } from 'react'
import { View as ViewType } from '../../types/general'
import { ReportsStringOverrides } from '../../views/Reports/Reports'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { ProfitAndLossDetailReport } from '../ProfitAndLossDetailReport'
import { ProfitAndLossDetailLinesDownloadButton } from '../ProfitAndLossDetailLinesDownloadButton'
import { View } from '../View'
import { BreadcrumbItem } from '../DetailReportBreadcrumb/DetailReportBreadcrumb'

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

  const handleLineItemClick = (lineItemName: string, breadcrumbPath: BreadcrumbItem[]) => {
    setSelectedLineItem({ lineItemName, breadcrumbPath })
  }

  const handleCloseDetailReport = () => {
    setSelectedLineItem(null)
  }

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
                    useComparisonPnl={!!comparisonConfig}
                    moneyFormat={csvMoneyFormat}
                    view={view}
                  />
                )}
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
            onBreadcrumbClick={(lineItemName: string) => {
              const clickedIndex = selectedLineItem.breadcrumbPath.findIndex(item => item.name === lineItemName)
              if (clickedIndex !== -1) {
                const newBreadcrumbPath = selectedLineItem.breadcrumbPath.slice(0, clickedIndex + 1)
                handleLineItemClick(lineItemName, newBreadcrumbPath)
              }
            }}
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
