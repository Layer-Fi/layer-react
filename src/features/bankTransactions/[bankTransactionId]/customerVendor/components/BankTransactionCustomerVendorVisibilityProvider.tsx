import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react'

const BankTransactionCustomerVendorVisibilityContext = createContext({
  showCustomerVendor: false,
})

export function useBankTransactionCustomerVendorVisibility() {
  return useContext(BankTransactionCustomerVendorVisibilityContext)
}

type BankTransactionCustomerVendorVisibilityProviderProps = PropsWithChildren<{
  showCustomerVendor: boolean
}>

export function BankTransactionCustomerVendorVisibilityProvider({
  children,
  showCustomerVendor,
}: BankTransactionCustomerVendorVisibilityProviderProps) {
  const value = useMemo(() => ({ showCustomerVendor }), [showCustomerVendor])

  return (
    <BankTransactionCustomerVendorVisibilityContext.Provider value={value}>
      {children}
    </BankTransactionCustomerVendorVisibilityContext.Provider>
  )
}
