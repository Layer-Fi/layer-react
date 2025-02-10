import { StatementOfCashFlowContext } from '../../contexts/StatementOfCashContext'
import { TableProvider } from '../../contexts/TableContext'
import { useStatementOfCashFlow } from '../../hooks/useStatementOfCashFlow'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Loader } from '../Loader'
import { StatementOfCashFlowTable } from '../StatementOfCashFlowTable'
import { StatementOfCashFlowTableStringOverrides } from '../StatementOfCashFlowTable/StatementOfCashFlowTable'
import { View } from '../View'
import { STATEMENT_OF_CASH_FLOW_ROWS } from './constants'
import { CashflowStatementDownloadButton } from './download/CashflowStatementDownloadButton'
import { useElementViewSize } from '../../hooks/useElementViewSize/useElementViewSize'
import { useState } from 'react'
import { endOfMonth, startOfDay, startOfMonth, subWeeks } from 'date-fns'
import { DatePicker } from '../DatePicker/DatePicker'
import { DatePickerModeSelector, DEFAULT_ALLOWED_PICKER_MODES } from '../DatePicker/ModeSelector/DatePickerModeSelector'
import { DatePickerMode } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'

const COMPONENT_NAME = 'statement-of-cash-flow'

export interface StatementOfCashFlowStringOverrides {
  statementOfCashFlowTable?: StatementOfCashFlowTableStringOverrides
}

export type StatementOfCashFlowProps = {
  stringOverrides?: StatementOfCashFlowStringOverrides
} & TimeRangePickerConfig

export const StatementOfCashFlow = (props: StatementOfCashFlowProps) => {
  const cashContextData = useStatementOfCashFlow()
  return (
    <StatementOfCashFlowContext.Provider value={cashContextData}>
      <StatementOfCashFlowView {...props} />
    </StatementOfCashFlowContext.Provider>
  )
}

type StatementOfCashFlowViewProps = {
  stringOverrides?: StatementOfCashFlowStringOverrides
} & TimeRangePickerConfig

const StatementOfCashFlowView = ({
  stringOverrides,
  allowedDatePickerModes,
  customDateRanges,
}: StatementOfCashFlowViewProps) => {
  // @TODO mover to useStatementOfCashFlow or new hook??
  const [startDate, setStartDate] = useState(
    startOfDay(subWeeks(new Date(), 4)),
  )
  const [endDate, setEndDate] = useState(startOfDay(new Date()))
  const { data, isLoading } = useStatementOfCashFlow(startDate, endDate)
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()

  const [datePickerMode, setDatePickerMode] = useState<DatePickerMode>(
    'monthPicker',
  )

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    if (dates[0]) {
      setStartDate(startOfDay(dates[0]))
    }
    if (dates[1]) {
      setEndDate(startOfDay(dates[1]))
    }
  }

  const datePicker =
    datePickerMode === 'monthPicker'
      ? (
        <DatePicker
          defaultSelected={startDate}
          onChange={(dates) => {
            if (!Array.isArray(dates)) {
              const date = dates
              handleDateChange([startOfMonth(date), endOfMonth(date)])
            }
          }}
          dateFormat='MMM'
          displayMode={datePickerMode}
          allowedModes={allowedDatePickerModes ?? DEFAULT_ALLOWED_PICKER_MODES}
          onChangeMode={setDatePickerMode}
          slots={{
            ModeSelector: DatePickerModeSelector,
          }}
        />
      )
      : (
        <DatePicker
          defaultSelected={[startDate, endDate]}
          customDateRanges={customDateRanges}
          onChange={dates =>
            handleDateChange(dates as [Date | null, Date | null])}
          dateFormat='MMM d'
          displayMode={datePickerMode}
          allowedModes={allowedDatePickerModes ?? DEFAULT_ALLOWED_PICKER_MODES}
          onChangeMode={setDatePickerMode}
          slots={{
            ModeSelector: DatePickerModeSelector,
          }}
        />
      )

  return (
    <TableProvider>
      <View
        type='panel'
        ref={containerRef}
        header={(
          <Header>
            <HeaderRow>
              <HeaderCol>
                {/* <StatementOfCashFlowDatePicker
                  allowedDatePickerModes={allowedDatePickerModes}
                  customDateRanges={customDateRanges}
                /> */}
                {datePicker}
              </HeaderCol>
              <HeaderCol>
                <CashflowStatementDownloadButton
                  startDate={startDate}
                  endDate={endDate}
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
