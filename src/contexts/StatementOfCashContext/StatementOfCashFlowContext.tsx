import { createContext } from 'react'
import { useStatementOfCashFlow } from '../../hooks/useStatementOfCashFlow'

export type StatementOfCashFlowContextType = ReturnType<
  typeof useStatementOfCashFlow
>
export const StatementOfCashFlowContext =
  createContext<StatementOfCashFlowContextType>({
    data: undefined,
    isLoading: false,
    error: undefined,
    refetch: () => {},
  })
