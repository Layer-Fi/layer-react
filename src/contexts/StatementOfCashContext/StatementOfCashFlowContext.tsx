import { createContext } from 'react'
import { useStatementOfCashFlow } from '../../hooks/useStatementOfCashFlow'
import { subWeeks } from 'date-fns'

export type StatementOfCashFlowContextType = ReturnType<
  typeof useStatementOfCashFlow
>
export const StatementOfCashFlowContext =
  createContext<StatementOfCashFlowContextType>({
    data: undefined,
    date: {
      startDate: subWeeks(new Date(), 4),
      endDate: new Date(),
    },
    setDate: () => {},
    isLoading: false,
    error: undefined,
    refetch: () => {},
  })
