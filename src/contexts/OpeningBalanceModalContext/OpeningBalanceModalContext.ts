import { createContext } from 'react'

import { type BankAccount } from '@internal-types/linkedAccounts'

export type OpeningBalanceModalContextType = {
  accountsToAddOpeningBalanceInModal: BankAccount[]
  setAccountsToAddOpeningBalanceInModal: (accounts: BankAccount[]) => void
}

export const OpeningBalanceModalContext = createContext<OpeningBalanceModalContextType>({
  accountsToAddOpeningBalanceInModal: [],
  setAccountsToAddOpeningBalanceInModal: () => {},
})
