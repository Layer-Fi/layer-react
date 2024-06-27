import React, { useState } from 'react'
import { StatementOfCashFlowContext } from '../../contexts/StatementOfCashContext'
import { TableExpandProvider } from '../../contexts/TableExpandContext'
import { useStatementOfCashFlow } from '../../hooks/useStatementOfCashFlow'
import { Container } from '../Container'
import { DateRangeInput } from '../Input'
import { Loader } from '../Loader'
import { PanelView } from '../PanelView'
import { StatementOfCashFlowTable } from '../StatementOfCashFlowTable'
import { STATEMENT_OF_CASH_FLOW_ROWS } from './constants'
import { startOfDay, subWeeks } from 'date-fns'

const COMPONENT_NAME = 'statement-of-cash-flow'

export const StatementOfCashFlow = () => {
  const cashContextData = useStatementOfCashFlow()
  return (
    <StatementOfCashFlowContext.Provider value={cashContextData}>
      <StatementOfCashFlowView />
    </StatementOfCashFlowContext.Provider>
  )
}

const StatementOfCashFlowView = () => {
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
    <TableExpandProvider>
      <Container name={COMPONENT_NAME}>
        <PanelView
          title='Statement of cash flow'
          headerControls={
            <>
              <DateRangeInput
                selected={[startDate, endDate]}
                onChange={dates => handleDateChange(dates)}
                dateFormat='MMM d'
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
            />
          )}
        </PanelView>
      </Container>
    </TableExpandProvider>
  )
}
