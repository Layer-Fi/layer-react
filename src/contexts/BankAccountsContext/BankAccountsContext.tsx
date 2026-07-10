import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react'

import { type LoadedStatus } from '@internal-types/general'
import { type SWRQueryResult } from '@internal-types/swr/SWRResponseTypes'
import { type BankAccount } from '@schemas/bankAccounts/bankAccount'
import { hasNewSyncingAccounts, isAnyBankAccountSyncing } from '@utils/bankAccount'
import { useListBankAccounts } from '@hooks/api/businesses/[business-id]/bank-accounts/useListBankAccounts'
import { usePollingConfig } from '@hooks/utils/swr/usePollingConfig'

type BankAccountsContextValue = Pick<
  SWRQueryResult<BankAccount[]>,
  | 'data'
  | 'isError'
  | 'isLoading'
  | 'isValidating'
  | 'refetch'
> & {
  disconnectedAccountsRequiringNotification: number
  isSyncing: boolean
  loadingStatus: LoadedStatus
}

const BANK_ACCOUNTS_POLL_INTERVAL_MS = 5 * 1000
const BANK_ACCOUNTS_MAX_POLL_STALL_MS = 15 * 60 * 1000

const requiresNotification = (bankAccount: BankAccount): boolean =>
  bankAccount.isDisconnected && bankAccount.notifyWhenDisconnected

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
    isError,
    isLoading,
    isValidating,
    refetch,
  } = useListBankAccounts({ swrOptions: pollingConfig })

  const value = useMemo<BankAccountsContextValue>(() => {
    const loadingStatus: LoadedStatus = isLoading
      ? 'loading'
      : data !== undefined || isError ? 'complete' : 'initial'

    return {
      data,
      disconnectedAccountsRequiringNotification: (data ?? []).filter(requiresNotification).length,
      isError,
      isLoading,
      isSyncing: isAnyBankAccountSyncing(data ?? []),
      isValidating,
      loadingStatus,
      refetch,
    }
  }, [
    data,
    isError,
    isLoading,
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
