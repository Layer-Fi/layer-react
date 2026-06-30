import { useCallback, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { type SWRInfiniteKeyedMutator } from 'swr/infinite'

import { type GetBankTransactionsReturn, useBankTransactionsGlobalCacheActions, type UseBankTransactionsOptions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useTriggerOnChange } from '@hooks/utils/useTriggerOnChange'
import { useBankAccountsContext } from '@contexts/BankAccountsContext/BankAccountsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const INITIAL_POLL_INTERVAL_MS = 1000
const POLL_INTERVAL_AFTER_TXNS_RECEIVED_MS = 5000
const BANK_TRANSACTIONS_SYNC_POLL_KEY = 'bank-transactions-sync-poll'

type UsePollBankTransactionsParams = {
  data: Array<GetBankTransactionsReturn> | undefined
  mutate: SWRInfiniteKeyedMutator<Array<GetBankTransactionsReturn>>
  useBankTransactionsOptions: UseBankTransactionsOptions
}

export function usePollBankTransactions({
  data,
  mutate,
  useBankTransactionsOptions,
}: UsePollBankTransactionsParams) {
  const { eventCallbacks } = useLayerContext()
  const onTransactionsFetched = eventCallbacks?.onTransactionsFetched

  const { isSyncing } = useBankAccountsContext()
  const { forceReloadBackgroundBankTransactions } = useBankTransactionsGlobalCacheActions()

  const wasSyncingRef = useRef(isSyncing)
  const hasReceivedTransactionsRef = useRef(false)

  const intervalMs = useCallback(() =>
    hasReceivedTransactionsRef.current
      ? POLL_INTERVAL_AFTER_TXNS_RECEIVED_MS
      : INITIAL_POLL_INTERVAL_MS,
  [])

  const onPoll = useCallback(async () => {
    await mutate()

    return Date.now()
  }, [mutate])

  useTriggerOnChange(data, isSyncing, () => {
    hasReceivedTransactionsRef.current = true
    onTransactionsFetched?.()
  })

  useSWR(
    isSyncing ? [BANK_TRANSACTIONS_SYNC_POLL_KEY, useBankTransactionsOptions] : null,
    onPoll,
    {
      refreshInterval: intervalMs,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  )

  useEffect(() => {
    if (wasSyncingRef.current && !isSyncing) {
      hasReceivedTransactionsRef.current = false
      void mutate()
      void forceReloadBackgroundBankTransactions(useBankTransactionsOptions)
    }

    wasSyncingRef.current = isSyncing
  }, [
    forceReloadBackgroundBankTransactions,
    isSyncing,
    mutate,
    useBankTransactionsOptions,
  ])
}
