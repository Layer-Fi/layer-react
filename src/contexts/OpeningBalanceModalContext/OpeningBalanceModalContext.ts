import { createContext } from 'react'

import { type BankAccount } from '@schemas/bankAccounts/bankAccount'

export type OpeningBalanceModalContextType = {
  accountsToAddOpeningBalanceInModal: BankAccount[]
  setAccountsToAddOpeningBalanceInModal: (accounts: BankAccount[]) => void
}

export const OpeningBalanceModalContext = createContext<OpeningBalanceModalContextType>({
  accountsToAddOpeningBalanceInModal: [],
  setAccountsToAddOpeningBalanceInModal: () => {},
})
