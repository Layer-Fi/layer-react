import { type Customer } from '@schemas/customer'
import { type StartTrackerEncoded, type TimeEntry, type UpsertTimeEntryEncoded } from '@schemas/timeTracking'

export type ActiveTimerDraft = {
  selectedServiceId: string | null
  selectedCustomer: Customer | null
  memo: string
}

export const EMPTY_DRAFT: ActiveTimerDraft = {
  selectedServiceId: null,
  selectedCustomer: null,
  memo: '',
}

export function getDraftFromEntry(activeEntry: TimeEntry | null | undefined): ActiveTimerDraft {
  if (!activeEntry) {
    return EMPTY_DRAFT
  }

  return {
    selectedServiceId: activeEntry.service?.id ?? null,
    selectedCustomer: activeEntry.customer ?? null,
    memo: activeEntry.memo ?? '',
  }
}

export function toStartPayload(draft: ActiveTimerDraft): StartTrackerEncoded | null {
  if (!draft.selectedServiceId) {
    return null
  }

  return {
    service_id: draft.selectedServiceId,
    billable: true,
    description: null,
    memo: draft.memo.trim() || null,
    metadata: null,
    ...(draft.selectedCustomer?.id && { customer_id: draft.selectedCustomer.id }),
  }
}

export type ActiveTimerDraftWithService = ActiveTimerDraft & { selectedServiceId: string }

export function hasDraftChanges(activeEntry: TimeEntry, draft: ActiveTimerDraftWithService): boolean {
  const memoValue = draft.memo.trim() || null

  return (
    draft.selectedServiceId !== (activeEntry.service?.id ?? null)
    || (draft.selectedCustomer?.id ?? null) !== (activeEntry.customer?.id ?? null)
    || memoValue !== (activeEntry.memo?.trim() || null)
  )
}

export function toUpdatePayload(
  activeEntry: TimeEntry,
  draft: ActiveTimerDraftWithService,
): Partial<UpsertTimeEntryEncoded> {
  return {
    billable: activeEntry.billable,
    description: activeEntry.description ?? null,
    memo: draft.memo.trim() || null,
    metadata: activeEntry.metadata ?? null,
    customer_id: draft.selectedCustomer?.id ?? null,
    service_id: draft.selectedServiceId,
  }
}
