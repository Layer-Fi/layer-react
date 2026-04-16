import { useCallback, useEffect, useRef, useState } from 'react'

import { type Customer } from '@schemas/customer'
import { type TimeEntry } from '@schemas/timeTracking'
import { type ActiveTimerDraft, EMPTY_DRAFT, getDraftFromEntry } from '@utils/timeTracking/activeTimerDraft'

export type UseActiveTimerDraftResult = {
  draft: ActiveTimerDraft
  setSelectedServiceId: (selectedServiceId: string | null) => void
  setSelectedCustomer: (selectedCustomer: Customer | null) => void
  setMemo: (memo: string) => void
  reset: () => void
}

export function useActiveTimerDraft(activeEntry: TimeEntry | null | undefined): UseActiveTimerDraftResult {
  const [draft, setDraft] = useState<ActiveTimerDraft>(() => getDraftFromEntry(activeEntry))
  const syncedActiveEntryIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!activeEntry) {
      syncedActiveEntryIdRef.current = null
      return
    }

    if (syncedActiveEntryIdRef.current === activeEntry.id) {
      return
    }

    syncedActiveEntryIdRef.current = activeEntry.id
    setDraft(getDraftFromEntry(activeEntry))
  }, [activeEntry])

  const setSelectedServiceId = useCallback((selectedServiceId: string | null) => {
    setDraft(prev => ({ ...prev, selectedServiceId }))
  }, [])

  const setSelectedCustomer = useCallback((selectedCustomer: Customer | null) => {
    setDraft(prev => ({ ...prev, selectedCustomer }))
  }, [])

  const setMemo = useCallback((memo: string) => {
    setDraft(prev => ({ ...prev, memo }))
  }, [])

  const reset = useCallback(() => {
    setDraft(EMPTY_DRAFT)
  }, [])

  return { draft, setSelectedServiceId, setSelectedCustomer, setMemo, reset }
}
