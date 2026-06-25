import { createContext, type ReactNode, useContext } from 'react'

import { type BankTransactionsStringOverrides } from '@components/BankTransactions/BankTransactions'

const EMPTY_STRING_OVERRIDES: BankTransactionsStringOverrides = {}

const BankTransactionsStringOverridesContext =
  createContext<BankTransactionsStringOverrides>(EMPTY_STRING_OVERRIDES)

export const useBankTransactionsStringOverrides = () =>
  useContext(BankTransactionsStringOverridesContext)

type BankTransactionsStringOverridesProviderProps = {
  children: ReactNode
  stringOverrides?: BankTransactionsStringOverrides
}

export const BankTransactionsStringOverridesProvider = ({
  children,
  stringOverrides,
}: BankTransactionsStringOverridesProviderProps) => (
  <BankTransactionsStringOverridesContext.Provider value={stringOverrides ?? EMPTY_STRING_OVERRIDES}>
    {children}
  </BankTransactionsStringOverridesContext.Provider>
)
