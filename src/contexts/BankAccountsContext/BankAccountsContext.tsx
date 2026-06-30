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
  | 'loadingStatus'
  | 'refetch'
>

const BankAccountsContext = createContext<BankAccountsContextValue>({
  data: undefined,
  isLoading: false,
  isError: false,
  refetch: () => Promise.resolve(undefined),
  disconnectedAccountsRequiringNotification: 0,
  isSyncing: false,
  loadingStatus: 'initial',
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
    loadingStatus,
    refetch,
  } = useListBankAccounts(pollingConfig)

  const value = useMemo<BankAccountsContextValue>(() => ({
    data,
    disconnectedAccountsRequiringNotification,
    isError,
    isLoading,
    isSyncing,
    loadingStatus,
    refetch,
  }), [
    data,
    disconnectedAccountsRequiringNotification,
    isError,
    isLoading,
    isSyncing,
    loadingStatus,
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
