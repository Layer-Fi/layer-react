import { HeaderRow } from '../Header/HeaderRow'
import { HeaderCol } from '../Header/HeaderCol'
import { Header } from '../Header/Header'
import { TableProvider } from '../../contexts/TableContext/TableContext'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { Loader } from '../Loader'
import { StatementOfCashFlowTable } from '../StatementOfCashFlowTable/StatementOfCashFlowTable'
import { StatementOfCashFlowTableStringOverrides } from '../StatementOfCashFlowTable/StatementOfCashFlowTable'
import { View } from '../View/View'
import { STATEMENT_OF_CASH_FLOW_ROWS } from './constants'
import { CashflowStatementDownloadButton } from './download/CashflowStatementDownloadButton'
import { useElementViewSize } from '../../hooks/useElementViewSize/useElementViewSize'
import { useGlobalDateRange } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { StatementOfCashFlowDatePicker } from './datePicker/StatementOfCashFlowDatePicker'
import { useStatementOfCashFlow } from '../../hooks/useStatementOfCashFlow/useStatementOfCashFlow'
import { ReportKey, ReportsModeStoreProvider, useReportModeWithFallback } from '../../providers/ReportsModeStoreProvider/ReportsModeStoreProvider'
import { getInitialDateRangePickerMode } from '../../providers/GlobalDateStore/useGlobalDateRangePicker'

const COMPONENT_NAME = 'statement-of-cash-flow'

export interface StatementOfCashFlowStringOverrides {
  statementOfCashFlowTable?: StatementOfCashFlowTableStringOverrides
}

export type StatementOfCashFlowProps = TimeRangePickerConfig & {
  stringOverrides?: StatementOfCashFlowStringOverrides
}

export const StandaloneStatementOfCashFlow = (props: StatementOfCashFlowProps) => {
  const initialModeForStatementOfCashFlows = getInitialDateRangePickerMode(props)

  return (
    <ReportsModeStoreProvider initialModes={{ StatementOfCashFlows: initialModeForStatementOfCashFlows }}>
      <StatementOfCashFlow {...props} />
    </ReportsModeStoreProvider>
  )
}

export const StatementOfCashFlow = (props: StatementOfCashFlowProps) => {
  return (
    <StatementOfCashFlowView {...props} />
  )
}

type StatementOfCashFlowViewProps = TimeRangePickerConfig & {
  stringOverrides?: StatementOfCashFlowStringOverrides
}

const StatementOfCashFlowView = ({
  stringOverrides,
  allowedDatePickerModes,
  defaultDatePickerMode,
  customDateRanges,
}: StatementOfCashFlowViewProps) => {
  const displayMode = useReportModeWithFallback(ReportKey.StatementOfCashFlows, 'monthPicker')
  const dateRange = useGlobalDateRange({ displayMode })
  const { data, isLoading } = useStatementOfCashFlow(dateRange)
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()

  return (
    <TableProvider>
      <View
        type='panel'
        ref={containerRef}
        header={(
          <Header>
            <HeaderRow>
              <HeaderCol>
                <StatementOfCashFlowDatePicker
                  allowedDatePickerModes={allowedDatePickerModes}
                  defaultDatePickerMode={defaultDatePickerMode}
                  customDateRanges={customDateRanges}
                />
              </HeaderCol>
              <HeaderCol>
                <CashflowStatementDownloadButton
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  iconOnly={view === 'mobile'}
                />
              </HeaderCol>
            </HeaderRow>
          </Header>
        )}
      >
        {!data || isLoading
          ? (
            <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
              <Loader />
            </div>
          )
          : (
            <StatementOfCashFlowTable
              data={data}
              config={STATEMENT_OF_CASH_FLOW_ROWS}
              stringOverrides={stringOverrides?.statementOfCashFlowTable}
            />
          )}
      </View>
    </TableProvider>
  )
}
