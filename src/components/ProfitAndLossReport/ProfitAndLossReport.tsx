import { RefObject, useContext } from 'react'
import { View as ViewType } from '../../types/general'
import { ReportsStringOverrides } from '../../views/Reports/Reports'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Panel } from '../Panel'
import { ProfitAndLoss } from '../ProfitAndLoss'
import { View } from '../View'
import { BookkeepingStatusPanelNotification } from '../BookkeepingStatus/BookkeepingStatusPanelNotification'
import { BookkeepingStatusReportRow } from '../BookkeepingStatus/BookkeepingStatusReportRow'

type ViewBreakpoint = ViewType | undefined

export type ProfitAndLossReportProps = {
  stringOverrides?: ReportsStringOverrides
  parentRef?: RefObject<HTMLDivElement>
  view?: ViewBreakpoint
  onViewBookkeepingTasks?: () => void
} & TimeRangePickerConfig

export const ProfitAndLossReport = ({
  stringOverrides,
  allowedDatePickerModes,
  datePickerMode,
  defaultDatePickerMode,
  customDateRanges,
  csvMoneyFormat,
  parentRef,
  view,
  onViewBookkeepingTasks,
}: ProfitAndLossReportProps) => {
  const { sidebarScope, dateRange } = useContext(ProfitAndLoss.Context)
  const { comparisonConfig } = useContext(ProfitAndLoss.ComparisonContext)

  return (
    <View
      type='panel'
      notification={<BookkeepingStatusPanelNotification onClick={onViewBookkeepingTasks} />}
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
          <BookkeepingStatusReportRow currentDate={dateRange.startDate} onViewBookkeepingTasks={onViewBookkeepingTasks} />
        </Header>
      )}
    >
      <Panel
        sidebar={(
          <ProfitAndLoss.DetailedCharts
            showDatePicker={false}
            stringOverrides={stringOverrides?.profitAndLoss?.detailedCharts}
          />
        )}
        sidebarIsOpen={Boolean(sidebarScope)}
        parentRef={parentRef}
      >
        <ProfitAndLoss.Table
          asContainer={false}
          stringOverrides={stringOverrides?.profitAndLoss?.table}
        />
      </Panel>
    </View>
  )
}
