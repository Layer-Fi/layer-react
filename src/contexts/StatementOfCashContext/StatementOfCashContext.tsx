import { createContext } from 'react'
import { useStatementOfCash } from '../../hooks/useStatementOfCash'

export type StatementOfCashContextType = ReturnType<typeof useStatementOfCash>
export const StatementOfCashContext = createContext<StatementOfCashContextType>(
  {
    data: undefined,
    isLoading: false,
    error: undefined,
  },
)
