import { HeaderRow } from '@components/Header/HeaderRow'
import { HeaderCol } from '@components/Header/HeaderCol'
import { Header } from '@components/Header/Header'
import { TableProvider } from '@contexts/TableContext/TableContext'
import type { TimeRangePickerConfig } from '@views/Reports/reportTypes'
import { Loader } from '@components/Loader/Loader'
import { StatementOfCashFlowTable } from '@components/StatementOfCashFlowTable/StatementOfCashFlowTable'
import { StatementOfCashFlowTableStringOverrides } from '@components/StatementOfCashFlowTable/StatementOfCashFlowTable'
import { View } from '@components/View/View'
import { STATEMENT_OF_CASH_FLOW_ROWS } from '@components/StatementOfCashFlow/constants'
import { CashflowStatementDownloadButton } from '@components/StatementOfCashFlow/download/CashflowStatementDownloadButton'
import { useElementViewSize } from '@hooks/useElementViewSize/useElementViewSize'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { useStatementOfCashFlow } from '@hooks/useStatementOfCashFlow/useStatementOfCashFlow'
import { ReportKey, ReportsModeStoreProvider, useReportModeWithFallback } from '@providers/ReportsModeStoreProvider/ReportsModeStoreProvider'
import { getInitialDateRangePickerMode } from '@providers/GlobalDateStore/useGlobalDateRangePicker'
import { CombinedDateRangeSelection } from '@components/DateSelection/CombinedDateRangeSelection'

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
  dateSelectionMode = 'full',
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
                <CombinedDateRangeSelection mode={dateSelectionMode} />
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
