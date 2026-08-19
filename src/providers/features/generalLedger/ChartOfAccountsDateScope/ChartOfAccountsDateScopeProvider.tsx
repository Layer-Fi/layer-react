import { createContext, type PropsWithChildren, useContext } from 'react'

// Whether Chart of Accounts balances are scoped to the ledger date range. Every
// reader has to agree or they resolve different `#ledger-balances` keys and
// refetch against each other, so this is read here rather than passed as a prop.
const ChartOfAccountsDateScopeContext = createContext(false)

export const useIsChartOfAccountsDateScoped = () => useContext(ChartOfAccountsDateScopeContext)

export function ChartOfAccountsDateScopeProvider({
  isDateScoped,
  children,
}: PropsWithChildren<{ isDateScoped: boolean }>) {
  return (
    <ChartOfAccountsDateScopeContext.Provider value={isDateScoped}>
      {children}
    </ChartOfAccountsDateScopeContext.Provider>
  )
}
