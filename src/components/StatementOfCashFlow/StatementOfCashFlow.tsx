import { TableProvider } from '../../contexts/TableContext'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Loader } from '../Loader'
import { StatementOfCashFlowTable } from '../StatementOfCashFlowTable'
import { StatementOfCashFlowTableStringOverrides } from '../StatementOfCashFlowTable/StatementOfCashFlowTable'
import { View } from '../View'
import { STATEMENT_OF_CASH_FLOW_ROWS } from './constants'
import { CashflowStatementDownloadButton } from './download/CashflowStatementDownloadButton'
import { useElementViewSize } from '../../hooks/useElementViewSize/useElementViewSize'
import { useGlobalDateRange } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { StatementOfCashFlowDatePicker } from './datePicker/StatementOfCashFlowDatePicker'
import { useStatementOfCashFlow } from '../../hooks/useStatementOfCashFlow/useStatementOfCashFlow'
import { BookkeepingStatusPanelNotification } from '../BookkeepingStatus/BookkeepingStatusPanelNotification'
import { BookkeepingStatusReportRow } from '../BookkeepingStatus/BookkeepingStatusReportRow'

const COMPONENT_NAME = 'statement-of-cash-flow'

export interface StatementOfCashFlowStringOverrides {
  statementOfCashFlowTable?: StatementOfCashFlowTableStringOverrides
}

export type StatementOfCashFlowProps = {
  stringOverrides?: StatementOfCashFlowStringOverrides
  redirectToBookkeepingTasks?: () => void
} & TimeRangePickerConfig

export const StatementOfCashFlow = (props: StatementOfCashFlowProps) => {
  return (
    <StatementOfCashFlowView {...props} />
  )
}

type StatementOfCashFlowViewProps = {
  stringOverrides?: StatementOfCashFlowStringOverrides
  redirectToBookkeepingTasks?: () => void
} & TimeRangePickerConfig

const StatementOfCashFlowView = ({
  stringOverrides,
  allowedDatePickerModes,
  customDateRanges,
  redirectToBookkeepingTasks,
}: StatementOfCashFlowViewProps) => {
  const { start, end } = useGlobalDateRange()
  const { data, isLoading } = useStatementOfCashFlow({ startDate: start, endDate: end })
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
                  customDateRanges={customDateRanges}
                />
              </HeaderCol>
              <HeaderCol>
                <CashflowStatementDownloadButton
                  startDate={start}
                  endDate={end}
                  iconOnly={view === 'mobile'}
                />
              </HeaderCol>
            </HeaderRow>
            <BookkeepingStatusReportRow currentDate={start} redirectToBookkeepingTasks={redirectToBookkeepingTasks} />
          </Header>
        )}
        notification={<BookkeepingStatusPanelNotification onClick={redirectToBookkeepingTasks} />}
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
