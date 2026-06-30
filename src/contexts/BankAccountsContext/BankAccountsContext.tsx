import { createContext, type PropsWithChildren, useCallback, useContext } from 'react'

import { type BankAccount } from '@schemas/bankAccounts/bankAccount'
import { isAnyBankAccountSyncing } from '@utils/bankAccount'
import {
  type ListBankAccountsSWRResponse,
  useListBankAccounts,
} from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'
import { usePollingConfig } from '@hooks/utils/swr/usePollingConfig'

type BankAccountsContextValue = Omit<ListBankAccountsSWRResponse, 'swrResponse' | 'error' | 'mutate'>

const BankAccountsContext = createContext<BankAccountsContextValue>({
  data: undefined,
  isLoading: false,
  isValidating: false,
  isError: false,
  refetch: () => Promise.resolve(undefined),
  disconnectedAccountsRequiringNotification: 0,
  isSyncing: false,
  loadingStatus: 'initial',
})

function useBankAccountsPollingConfig() {
  const shouldContinue = useCallback(
    (accounts: BankAccount[] | undefined) => accounts === undefined || isAnyBankAccountSyncing(accounts),
    [],
  )

  return usePollingConfig<BankAccount[]>({
    shouldContinue,
    maxDurationMs: Number.POSITIVE_INFINITY,
  })
}

export function BankAccountsProvider({ children }: PropsWithChildren) {
  const pollingConfig = useBankAccountsPollingConfig()
  const bankAccounts = useListBankAccounts(pollingConfig)

  return (
    <BankAccountsContext.Provider value={bankAccounts}>
      {children}
    </BankAccountsContext.Provider>
  )
}

export function useBankAccountsContext() {
  return useContext(BankAccountsContext)
}
