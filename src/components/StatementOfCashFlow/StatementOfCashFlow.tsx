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
import { useContext, useEffect } from 'react'
import { StatementOfCashFlowDatePicker } from './datePicker/StatementOfCashFlowDatePicker'

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
  // const [startDate, setStartDate] = useState(

  // )
  // const [endDate, setEndDate] = useState(startOfDay(new Date()))

  const { data, date, isLoading } = useContext(StatementOfCashFlowContext)
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()

  useEffect(() => {
    console.log('---- ', date)
  }, [date])

  // const [datePickerMode, setDatePickerMode] = useState<DatePickerMode>(
  //   'monthPicker',
  // )

  // const handleDateChange = (dates: [Date | null, Date | null]) => {
  //   if (dates[0] && dates[1]) {
  //     setDate({ startDate: startOfDay(dates[0]), endDate: startOfDay(dates[1]) })
  //   }
  //   else if (dates[0]) {
  //     setDate({ startDate: startOfDay(dates[0]) })
  //   }
  //   else if (dates[1]) {
  //     setDate({ endDate: startOfDay(dates[1]) })
  //   }
  // }

  // const datePicker =
  //   datePickerMode === 'monthPicker'
  //     ? (
  //       <DatePicker
  //         defaultSelected={date.startDate}
  //         onChange={(dates) => {
  //           if (!Array.isArray(dates)) {
  //             const date = dates
  //             console.log('on date picker change', date)
  //             handleDateChange([startOfMonth(date), endOfMonth(date)])
  //           }
  //         }}
  //         dateFormat='MMM'
  //         displayMode={datePickerMode}
  //         allowedModes={allowedDatePickerModes ?? DEFAULT_ALLOWED_PICKER_MODES}
  //         onChangeMode={setDatePickerMode}
  //         slots={{
  //           ModeSelector: DatePickerModeSelector,
  //         }}
  //       />
  //     )
  //     : (
  //       <DatePicker
  //         defaultSelected={[date.startDate, date.endDate]}
  //         customDateRanges={customDateRanges}
  //         onChange={(dates) => {
  //           console.log('on date picker change 2', dates)
  //           handleDateChange(dates as [Date | null, Date | null])
  //         }}
  //         dateFormat='MMM d'
  //         displayMode={datePickerMode}
  //         allowedModes={allowedDatePickerModes ?? DEFAULT_ALLOWED_PICKER_MODES}
  //         onChangeMode={setDatePickerMode}
  //         slots={{
  //           ModeSelector: DatePickerModeSelector,
  //         }}
  //       />
  //     )

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
                  defaultDatePickerMode='monthPicker'
                />
              </HeaderCol>
              <HeaderCol>
                {date?.startDate && date?.endDate
                  ? (
                    <CashflowStatementDownloadButton
                      startDate={date.startDate}
                      endDate={date.endDate}
                      iconOnly={view === 'mobile'}
                    />
                  )
                  : null}
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
