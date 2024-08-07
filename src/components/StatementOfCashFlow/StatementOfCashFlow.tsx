import React, { useState } from 'react'
import { StatementOfCashFlowContext } from '../../contexts/StatementOfCashContext'
import { TableProvider } from '../../contexts/TableContext'
import { useStatementOfCashFlow } from '../../hooks/useStatementOfCashFlow'
import { DatePicker } from '../DatePicker'
import { Loader } from '../Loader'
import { StatementOfCashFlowTable } from '../StatementOfCashFlowTable'
import { View } from '../View'
import { STATEMENT_OF_CASH_FLOW_ROWS } from './constants'
import { startOfDay, subWeeks } from 'date-fns'
import { StatementOfCashFlowTableStringOverrides } from '../StatementOfCashFlowTable/StatementOfCashFlowTable'

const COMPONENT_NAME = 'statement-of-cash-flow'

export interface StatementOfCashFlowStringOverrides {
  statementOfCashFlowTable?: StatementOfCashFlowTableStringOverrides
}

export const StatementOfCashFlow = ({ stringOverrides }: { stringOverrides?: StatementOfCashFlowStringOverrides }) => {
  const cashContextData = useStatementOfCashFlow()
  return (
    <StatementOfCashFlowContext.Provider value={cashContextData}>
      <StatementOfCashFlowView stringOverrides={stringOverrides} />
    </StatementOfCashFlowContext.Provider>
  )
}

const StatementOfCashFlowView = ( { stringOverrides }: {stringOverrides?: StatementOfCashFlowStringOverrides }) => {
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

  return (
    <TableProvider>
      <View
        type='panel'
        headerControls={
          <>
            <DatePicker
              selected={[startDate, endDate]}
              onChange={dates =>
                handleDateChange(dates as [Date | null, Date | null])
              }
              dateFormat='MMM d'
              mode='dayRangePicker'
            />
          </>
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
