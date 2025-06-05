import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react'

const BankTransactionTagVisibilityContext = createContext({
  showTags: false,
})

export function useBankTransactionTagVisibility() {
  return useContext(BankTransactionTagVisibilityContext)
}

type BankTransactionTagVisibilityProviderProps = PropsWithChildren<{
  showTags: boolean
}>

export function BankTransactionTagVisibilityProvider({
  children,
  showTags,
}: BankTransactionTagVisibilityProviderProps) {
  const value = useMemo(() => ({ showTags }), [showTags])

  return (
    <BankTransactionTagVisibilityContext.Provider value={value}>
      {children}
    </BankTransactionTagVisibilityContext.Provider>
  )
}
