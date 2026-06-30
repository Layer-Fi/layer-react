import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react'

import { type BankAccount } from '@schemas/bankAccounts/bankAccount'
import { isAnyBankAccountSyncing } from '@utils/bankAccount'
import { type ListBankAccountsSWRResponse, useListBankAccounts } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'
import { usePollingConfig } from '@hooks/utils/swr/usePollingConfig'

type BankAccountsContextValue = Pick<
  ListBankAccountsSWRResponse,
  | 'data'
  | 'disconnectedAccountsRequiringNotification'
  | 'isError'
  | 'isLoading'
  | 'isSyncing'
  | 'isValidating'
  | 'loadingStatus'
  | 'refetch'
>

const BankAccountsContext = createContext<BankAccountsContextValue>({
  data: undefined,
  disconnectedAccountsRequiringNotification: 0,
  isLoading: false,
  isError: false,
  isSyncing: false,
  isValidating: false,
  loadingStatus: 'initial',
  refetch: () => Promise.resolve(undefined),
})

function useBankAccountsPollingConfig() {
  const shouldContinue = useCallback(
    (accounts: BankAccount[] | undefined) => accounts !== undefined && isAnyBankAccountSyncing(accounts),
    [],
  )

  return usePollingConfig<BankAccount[]>({
    shouldContinue,
    maxDurationMs: Number.POSITIVE_INFINITY,
  })
}

export function BankAccountsProvider({ children }: PropsWithChildren) {
  const pollingConfig = useBankAccountsPollingConfig()
  const {
    data,
    disconnectedAccountsRequiringNotification,
    isError,
    isLoading,
    isSyncing,
    isValidating,
    loadingStatus,
    refetch,
  } = useListBankAccounts(pollingConfig)

  const value = useMemo<BankAccountsContextValue>(() => ({
    data,
    disconnectedAccountsRequiringNotification,
    isError,
    isLoading,
    isSyncing,
    isValidating,
    loadingStatus,
    refetch,
  }), [
    data,
    disconnectedAccountsRequiringNotification,
    isError,
    isLoading,
    isSyncing,
    loadingStatus,
    isValidating,
    refetch,
  ])

  return (
    <BankAccountsContext.Provider value={value}>
      {children}
    </BankAccountsContext.Provider>
  )
}

export function useBankAccountsContext() {
  return useContext(BankAccountsContext)
}
