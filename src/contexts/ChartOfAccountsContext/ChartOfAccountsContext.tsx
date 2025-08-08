import { createContext } from 'react'
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts'
import { endOfMonth, startOfMonth } from 'date-fns'

export type ChartOfAccountsContextType = ReturnType<typeof useChartOfAccounts>
export const ChartOfAccountsContext = createContext<ChartOfAccountsContextType>(
  {
    data: undefined,
    isLoading: false,
    isValidating: false,
    error: undefined,
    refetch: () => Promise.resolve(undefined),
    create: () => Promise.resolve(undefined),
    form: undefined,
    sendingForm: false,
    apiError: undefined,
    addAccount: () => {},
    editAccount: () => {},
    deleteAccount: () => {},
    cancelForm: () => {},
    changeFormData: () => {},
    submitForm: () => {},
    dateRange: {
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    },
    changeDateRange: () => {},
  },
)
