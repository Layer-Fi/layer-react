import React, { PropsWithChildren, useState } from 'react'
import { StatementOfCashContext } from '../../contexts/StatementOfCashContext'
import { TableExpandProvider } from '../../contexts/TableExpandContext'
import { useStatementOfCash } from '../../hooks/useStatementOfCash'
import { Container } from '../Container'
import { DateRangeInput } from '../Input'
import { Loader } from '../Loader'
import { PanelView } from '../PanelView'
import { StatementOfCashTable } from '../StatementOfCashTable'
import { STATEMENT_OF_CASH_ROWS } from './constants'
import { startOfDay, subWeeks } from 'date-fns'

const COMPONENT_NAME = 'statement-of-cash'

export const StatementOfCash = () => {
  const cashContextData = useStatementOfCash()
  return (
    <StatementOfCashContext.Provider value={cashContextData}>
      <StatementOfCashView />
    </StatementOfCashContext.Provider>
  )
}

const StatementOfCashView = () => {
  const [startDate, setStartDate] = useState(
    startOfDay(subWeeks(new Date(), 2)),
  )
  const [endDate, setEndDate] = useState(startOfDay(new Date()))
  const { data, isLoading } = useStatementOfCash(startDate, endDate)

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    if (dates[0]) {
      setStartDate(startOfDay(dates[0]))
    }
    if (dates[1]) {
      setEndDate(startOfDay(dates[1]))
    }
  }

  return (
    <TableExpandProvider>
      <Container name={COMPONENT_NAME}>
        <PanelView
          title='Statement Of Cash'
          headerControls={
            <>
              <DateRangeInput
                selected={[startDate, endDate]}
                onChange={dates => handleDateChange(dates)}
              />
            </>
          }
        >
          {!data || isLoading ? (
            <div className={`Layer__${COMPONENT_NAME}__loader-container`}>
              <Loader />
            </div>
          ) : (
            <StatementOfCashTable data={data} config={STATEMENT_OF_CASH_ROWS} />
          )}
        </PanelView>
      </Container>
    </TableExpandProvider>
  )
}
