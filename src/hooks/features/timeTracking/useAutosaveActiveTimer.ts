import { useEffect } from 'react'

import { type TimeEntry, type UpsertTimeEntryEncoded } from '@schemas/timeTracking'
import { type ActiveTimerDraft, hasDraftChanges, toUpdatePayload } from '@utils/timeTracking/activeTimerDraft'

const AUTOSAVE_DEBOUNCE_MS = 500

type UseAutosaveActiveTimerParams = {
  activeEntry: TimeEntry | null | undefined
  draft: ActiveTimerDraft
  updateTimeEntry: (payload: Partial<UpsertTimeEntryEncoded>) => Promise<unknown>
  setError: (message: string | null) => void
  errorMessage: string
}

export function useAutosaveActiveTimer({
  activeEntry,
  draft,
  updateTimeEntry,
  setError,
  errorMessage,
}: UseAutosaveActiveTimerParams) {
  useEffect(() => {
    if (!activeEntry || !draft.selectedServiceId) {
      return
    }

    const draftWithService = { ...draft, selectedServiceId: draft.selectedServiceId }
    if (!hasDraftChanges(activeEntry, draftWithService)) {
      return
    }

    setError(null)

    let cancelled = false

    const timeoutId = window.setTimeout(() => {
      void updateTimeEntry(toUpdatePayload(activeEntry, draftWithService)).catch(() => {
        if (!cancelled) {
          setError(errorMessage)
        }
      })
    }, AUTOSAVE_DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [activeEntry, draft, updateTimeEntry, setError, errorMessage])
}
