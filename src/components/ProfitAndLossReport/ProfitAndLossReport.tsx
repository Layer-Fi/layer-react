import { useContext, useState } from 'react'
import { View as ViewType } from '../../types/general'
import { ReportsStringOverrides } from '../../views/Reports/Reports'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { ProfitAndLossDetailReport } from '../ProfitAndLossDetailReport'
import { View } from '../View'

type ViewBreakpoint = ViewType | undefined

export type ProfitAndLossReportProps = {
  stringOverrides?: ReportsStringOverrides
  view?: ViewBreakpoint
} & TimeRangePickerConfig

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
  const [selectedLineItemName, setSelectedLineItemName] = useState<string | null>(null)
  const [isDetailReportVisible, setIsDetailReportVisible] = useState(false)

  const handleLineItemClick = (lineItemName: string) => {
    setSelectedLineItemName(lineItemName)
    setIsDetailReportVisible(true)
  }

  const handleCloseDetailReport = () => {
    setIsDetailReportVisible(false)
    setSelectedLineItemName(null)
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
      {isDetailReportVisible && selectedLineItemName
        ? (
          <ProfitAndLossDetailReport
            lineItemName={selectedLineItemName}
            onClose={handleCloseDetailReport}
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
