import { useCallback, useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { type SWRInfiniteKeyedMutator } from 'swr/infinite'

import { hasNewSyncingAccounts } from '@utils/bankAccount'
import { type GetBankTransactionsReturn, useBankTransactionsGlobalCacheActions, type UseBankTransactionsOptions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useTriggerOnChange } from '@hooks/utils/useTriggerOnChange'
import { useBankAccountsContext } from '@contexts/BankAccountsContext/BankAccountsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

const INITIAL_POLL_INTERVAL_MS = 2000
const POLL_INTERVAL_AFTER_TXNS_RECEIVED_MS = 5000
const MAX_POLL_STALL_MS = 15 * 60 * 1000
const BANK_TRANSACTIONS_SYNC_POLL_KEY = '#bank-transactions-sync-poll'

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

  const { isSyncing, data: bankAccounts } = useBankAccountsContext()
  const { forceReloadBackgroundBankTransactions } = useBankTransactionsGlobalCacheActions()

  const wasSyncingRef = useRef(isSyncing)
  const previousBankAccountsRef = useRef(bankAccounts)
  const hasReceivedTransactionsRef = useRef(false)
  const stallDeadlineRef = useRef(isSyncing ? Date.now() + MAX_POLL_STALL_MS : null)
  // Part of the SWR key: bumping it restarts the poll after the stall deadline
  // stopped it, since refreshInterval alone won't resume a halted SWR loop.
  const [restartNonce, setRestartNonce] = useState(0)

  const intervalMs = useCallback(() => {
    if (stallDeadlineRef.current != null && Date.now() >= stallDeadlineRef.current) {
      return 0
    }

    return hasReceivedTransactionsRef.current
      ? POLL_INTERVAL_AFTER_TXNS_RECEIVED_MS
      : INITIAL_POLL_INTERVAL_MS
  }, [])

  const onPoll = useCallback(async () => {
    await mutate()

    return Date.now()
  }, [mutate])

  useTriggerOnChange(data, isSyncing, () => {
    hasReceivedTransactionsRef.current = true
    onTransactionsFetched?.()
  })

  /*
   * useBankTransactions disables revalidateFirstPage so page changes do not
   * refetch already-loaded pages. That also means a refreshInterval on the
   * infinite query would not refresh transactions, so this separate SWR key
   * owns the sync polling timer and explicitly triggers the invalidation of
   * stale transactions to force a refresh.
   */
  useSWR(
    isSyncing ? [BANK_TRANSACTIONS_SYNC_POLL_KEY, useBankTransactionsOptions, restartNonce] : null,
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
    if (hasNewSyncingAccounts(previousBankAccountsRef.current, bankAccounts)) {
      // If the stall deadline already lapsed, refreshInterval returned 0 and the
      // poll stopped; bump the key's nonce to restart it. Otherwise it's still
      // polling, so just extend the deadline.
      const wasStalled = stallDeadlineRef.current != null && Date.now() >= stallDeadlineRef.current

      stallDeadlineRef.current = Date.now() + MAX_POLL_STALL_MS

      if (wasStalled) setRestartNonce(nonce => nonce + 1)
    }

    if (wasSyncingRef.current && !isSyncing) {
      stallDeadlineRef.current = null
      hasReceivedTransactionsRef.current = false
      void mutate()
      void forceReloadBackgroundBankTransactions(useBankTransactionsOptions)
    }

    wasSyncingRef.current = isSyncing
    previousBankAccountsRef.current = bankAccounts
  }, [
    bankAccounts,
    forceReloadBackgroundBankTransactions,
    isSyncing,
    mutate,
    useBankTransactionsOptions,
  ])
}
