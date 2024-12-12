import React, { useState } from 'react'
import { StatementOfCashFlowContext } from '../../contexts/StatementOfCashContext'
import { TableProvider } from '../../contexts/TableContext'
import { useStatementOfCashFlow } from '../../hooks/useStatementOfCashFlow'
import type { TimeRangePickerConfig } from '../../views/Reports/reportTypes'
import { DatePicker } from '../DatePicker'
import type { DatePickerMode } from '../DatePicker/ModeSelector/DatePickerModeSelector'
import {
  DatePickerModeSelector,
  DEFAULT_ALLOWED_PICKER_MODES,
} from '../DatePicker/ModeSelector/DatePickerModeSelector'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Loader } from '../Loader'
import { StatementOfCashFlowTable } from '../StatementOfCashFlowTable'
import { StatementOfCashFlowTableStringOverrides } from '../StatementOfCashFlowTable/StatementOfCashFlowTable'
import { View } from '../View'
import { STATEMENT_OF_CASH_FLOW_ROWS } from './constants'
import { endOfMonth, startOfDay, startOfMonth, subWeeks } from 'date-fns'
import { CashflowStatementDownloadButton } from './download/CashflowStatementDownloadButton'
import { useElementViewSize } from '../../hooks/useElementViewSize/useElementViewSize'

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
  datePickerMode: deprecated_datePickerMode,
  defaultDatePickerMode = 'monthPicker',
  allowedDatePickerModes,
  customDateRanges,
}: StatementOfCashFlowViewProps) => {
  const [startDate, setStartDate] = useState(
    startOfDay(subWeeks(new Date(), 4)),
  )
  const [endDate, setEndDate] = useState(startOfDay(new Date()))
  const { data, isLoading, refetch } = useStatementOfCashFlow(
    startDate,
    endDate,
  )
  const { view, containerRef } = useElementViewSize<HTMLDivElement>()

  const [datePickerMode, setDatePickerMode] = useState<DatePickerMode>(
    deprecated_datePickerMode ?? defaultDatePickerMode,
  )

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    if (dates[0]) {
      setStartDate(startOfDay(dates[0]))
    }
    if (dates[1]) {
      setEndDate(startOfDay(dates[1]))
    }

    if (dates[0] && dates[1]) {
      refetch()
    }
  }

  const datePicker =
    datePickerMode === 'monthPicker'
      ? (
        <DatePicker
          selected={startDate}
          onChange={(dates) => {
            if (!Array.isArray(dates)) {
              const date = dates as Date
              handleDateChange([startOfMonth(date), endOfMonth(date)])
            }
          }}
          dateFormat='MMM'
          mode={datePickerMode}
          allowedModes={allowedDatePickerModes ?? DEFAULT_ALLOWED_PICKER_MODES}
          onChangeMode={setDatePickerMode}
          slots={{
            ModeSelector: DatePickerModeSelector,
          }}
        />
      )
      : (
        <DatePicker
          selected={[startDate, endDate]}
          customDateRanges={customDateRanges}
          onChange={dates =>
            handleDateChange(dates as [Date | null, Date | null])}
          dateFormat='MMM d'
          mode={datePickerMode}
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
              <HeaderCol>{datePicker}</HeaderCol>
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
