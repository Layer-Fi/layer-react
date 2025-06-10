import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react'

const BankTransactionSecondPartyVisibilityContext = createContext({
  showSecondParty: false,
})

export function useBankTransactionSecondPartyVisibility() {
  return useContext(BankTransactionSecondPartyVisibilityContext)
}

type BankTransactionSecondPartyVisibilityProviderProps = PropsWithChildren<{
  showSecondParty: boolean
}>

export function BankTransactionSecondPartyVisibilityProvider({
  children,
  showSecondParty,
}: BankTransactionSecondPartyVisibilityProviderProps) {
  const value = useMemo(() => ({ showSecondParty }), [showSecondParty])

  return (
    <BankTransactionSecondPartyVisibilityContext.Provider value={value}>
      {children}
    </BankTransactionSecondPartyVisibilityContext.Provider>
  )
}
