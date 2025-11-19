import { createContext } from 'react'

import { type useChartOfAccounts } from '@hooks/useChartOfAccounts/useChartOfAccounts'

export type ChartOfAccountsContextType = ReturnType<typeof useChartOfAccounts>
export const ChartOfAccountsContext = createContext<ChartOfAccountsContextType>(
  {
    data: undefined,
    isLoading: false,
    isValidating: false,
    isError: false,
    refetch: () => Promise.resolve(),
    create: () => Promise.resolve(undefined),
    form: undefined,
    sendingForm: false,
    apiError: undefined,
    addAccount: () => {},
    editAccount: () => {},
    deleteAccount: () => Promise.resolve(undefined),
    cancelForm: () => {},
    changeFormData: () => {},
    submitForm: () => {},
  },
)
