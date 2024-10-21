import React, { useState } from 'react'
import { StatementOfCashFlowContext } from '../../contexts/StatementOfCashContext'
import { TableProvider } from '../../contexts/TableContext'
import { useStatementOfCashFlow } from '../../hooks/useStatementOfCashFlow'
import { DatePicker } from '../DatePicker'
import type { DatePickerMode } from '../DatePicker/ModeSelector/DatePickerModeSelector'
import { DatePickerModeSelector } from '../DatePicker/ModeSelector/DatePickerModeSelector'
import { Header, HeaderCol, HeaderRow } from '../Header'
import { Loader } from '../Loader'
import { StatementOfCashFlowTable } from '../StatementOfCashFlowTable'
import { StatementOfCashFlowTableStringOverrides } from '../StatementOfCashFlowTable/StatementOfCashFlowTable'
import { View } from '../View'
import { STATEMENT_OF_CASH_FLOW_ROWS } from './constants'
import { endOfMonth, startOfDay, startOfMonth, subWeeks } from 'date-fns'

const COMPONENT_NAME = 'statement-of-cash-flow'

export interface StatementOfCashFlowStringOverrides {
  statementOfCashFlowTable?: StatementOfCashFlowTableStringOverrides
  datePickerMode?: DatePickerMode
}

export interface StatementOfCashFlowProps {
  stringOverrides?: StatementOfCashFlowStringOverrides

  /**
   * @deprecated Use `defaultDatePickedMode` instead
   */
  datePickerMode?: DatePickerMode
  defaultDatePickerMode?: DatePickerMode
}

export const StatementOfCashFlow = ({
  stringOverrides,
  datePickerMode: deprecated_datePickerMode,
  defaultDatePickerMode,
}: StatementOfCashFlowProps) => {
  const cashContextData = useStatementOfCashFlow()
  return (
    <StatementOfCashFlowContext.Provider value={cashContextData}>
      <StatementOfCashFlowView
        stringOverrides={stringOverrides}
        defaultDatePickerMode={
          defaultDatePickerMode ?? deprecated_datePickerMode
        }
      />
    </StatementOfCashFlowContext.Provider>
  )
}

type StatementOfCashFlowViewProps = {
  stringOverrides?: StatementOfCashFlowStringOverrides
  defaultDatePickerMode?: DatePickerMode
}

const StatementOfCashFlowView = ({
  stringOverrides,
  defaultDatePickerMode = 'monthPicker',
}: StatementOfCashFlowViewProps) => {
  const [startDate, setStartDate] = useState(
    startOfDay(subWeeks(new Date(), 4)),
  )
  const [endDate, setEndDate] = useState(startOfDay(new Date()))
  const { data, isLoading, refetch } = useStatementOfCashFlow(
    startDate,
    endDate,
  )

  const [datePickerMode, setDatePickerMode] = useState<DatePickerMode>(
    defaultDatePickerMode,
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
    datePickerMode === 'monthPicker' ? (
      <DatePicker
        selected={startDate}
        onChange={dates => {
          if (!Array.isArray(dates)) {
            const date = dates as Date
            handleDateChange([startOfMonth(date), endOfMonth(date)])
          }
        }}
        dateFormat='MMM'
        mode={datePickerMode}
        allowedModes={['dayRangePicker', 'monthPicker']}
        onChangeMode={setDatePickerMode}
        slots={{
          ModeSelector: DatePickerModeSelector,
        }}
      />
    ) : (
      <DatePicker
        selected={[startDate, endDate]}
        onChange={dates =>
          handleDateChange(dates as [Date | null, Date | null])
        }
        dateFormat='MMM d'
        mode={datePickerMode}
        allowedModes={['dayRangePicker', 'monthPicker']}
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
        header={
          <Header>
            <HeaderRow>
              <HeaderCol>{datePicker}</HeaderCol>
            </HeaderRow>
          </Header>
        }
      >
        {!data || isLoading ? (
          <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
            <Loader />
          </div>
        ) : (
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
