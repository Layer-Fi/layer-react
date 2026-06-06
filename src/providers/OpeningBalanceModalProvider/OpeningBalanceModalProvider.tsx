import { type PropsWithChildren, useMemo, useState } from 'react'

import { type BankAccount } from '@internal-types/linkedAccounts'
import { OpeningBalanceModalContext } from '@contexts/OpeningBalanceModalContext/OpeningBalanceModalContext'

export function OpeningBalanceModalProvider({ children }: PropsWithChildren) {
  const [accountsToAddOpeningBalanceInModal, setAccountsToAddOpeningBalanceInModal] =
    useState<BankAccount[]>([])

  const value = useMemo(
    () => ({
      accountsToAddOpeningBalanceInModal,
      setAccountsToAddOpeningBalanceInModal,
    }),
    [accountsToAddOpeningBalanceInModal],
  )

  return (
    <OpeningBalanceModalContext.Provider value={value}>
      {children}
    </OpeningBalanceModalContext.Provider>
  )
}
