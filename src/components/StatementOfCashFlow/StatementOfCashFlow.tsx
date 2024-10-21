import React, { useState } from 'react'
import { StatementOfCashFlowContext } from '../../contexts/StatementOfCashContext'
import { TableProvider } from '../../contexts/TableContext'
import { useStatementOfCashFlow } from '../../hooks/useStatementOfCashFlow'
import { DatePicker } from '../DatePicker'
import {
  DatePickerMode,
  DateRangeDatePickerModes,
} from '../DatePicker/DatePicker'
import { CustomDateRange } from '../DatePicker/DatePickerOptions'
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
}

export interface StatementOfCashFlowProps {
  stringOverrides?: StatementOfCashFlowStringOverrides
  datePickerMode?: DateRangeDatePickerModes
  customDateRanges?: CustomDateRange[]
}
export const StatementOfCashFlow = ({
  stringOverrides,
  customDateRanges,
  datePickerMode,
}: StatementOfCashFlowProps) => {
  const cashContextData = useStatementOfCashFlow()
  return (
    <StatementOfCashFlowContext.Provider value={cashContextData}>
      <StatementOfCashFlowView
        stringOverrides={stringOverrides}
        datePickerMode={datePickerMode}
        customDateRanges={customDateRanges}
      />
    </StatementOfCashFlowContext.Provider>
  )
}

const StatementOfCashFlowView = ({
  stringOverrides,
  customDateRanges,
  datePickerMode = 'dayRangePicker',
}: StatementOfCashFlowProps) => {
  const [startDate, setStartDate] = useState(
    startOfDay(subWeeks(new Date(), 4)),
  )
  const [endDate, setEndDate] = useState(startOfDay(new Date()))
  const { data, isLoading, refetch } = useStatementOfCashFlow(
    startDate,
    endDate,
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
      />
    ) : (
      <DatePicker
        selected={[startDate, endDate]}
        customDateRanges={customDateRanges}
        onChange={dates =>
          handleDateChange(dates as [Date | null, Date | null])
        }
        dateFormat='MMM d'
        mode={datePickerMode}
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
