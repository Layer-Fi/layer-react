import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react'

import { type BankAccount } from '@schemas/bankAccounts/bankAccount'
import { hasNewSyncingAccounts, isAnyBankAccountSyncing } from '@utils/bankAccount'
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

const BANK_ACCOUNTS_POLL_INTERVAL_MS = 5 * 1000
const BANK_ACCOUNTS_MAX_POLL_STALL_MS = 15 * 60 * 1000

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
    shouldRestartPolling: hasNewSyncingAccounts,
    intervalMs: BANK_ACCOUNTS_POLL_INTERVAL_MS,
    maxDurationMs: BANK_ACCOUNTS_MAX_POLL_STALL_MS,
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
