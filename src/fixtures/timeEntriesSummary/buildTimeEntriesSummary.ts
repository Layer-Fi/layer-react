import { type TimeEntry, type TimeEntrySummary, type TimeEntrySummaryGroup } from '@schemas/timeTracking'

const MINUTES_PER_HOUR = 60
const UNASSIGNED_SERVICE_NAME = 'Unassigned'

// Billable amount for one entry, in cents: hours worked * the service's
// per-hour rate. Non-billable entries and entries without a rate contribute 0.
const billableAmountCents = (entry: TimeEntry): number => {
  const rate = entry.service?.billableRatePerHourAmount
  if (!entry.billable || rate == null) return 0

  return Math.round((entry.durationMinutes / MINUTES_PER_HOUR) * rate)
}

type MutableGroup = {
  id: string | null
  name: string
  totalMinutes: number
  totalBillableMinutes: number
  totalBillableAmount: number
  entryCount: number
}

/** Aggregates time entries into the summary the API would compute from them. */
export const buildTimeEntriesSummary = (entries: readonly TimeEntry[]): TimeEntrySummary => {
  const groupsByKey = new Map<string, MutableGroup>()
  let totalMinutes = 0
  let totalBillableMinutes = 0
  let totalBillableAmount = 0

  for (const entry of entries) {
    if (entry.deletedAt != null) continue

    const billableMinutes = entry.billable ? entry.durationMinutes : 0
    const amount = billableAmountCents(entry)

    totalMinutes += entry.durationMinutes
    totalBillableMinutes += billableMinutes
    totalBillableAmount += amount

    const key = entry.service?.id ?? UNASSIGNED_SERVICE_NAME
    const group = groupsByKey.get(key) ?? {
      id: entry.service?.id ?? null,
      name: entry.service?.name ?? UNASSIGNED_SERVICE_NAME,
      totalMinutes: 0,
      totalBillableMinutes: 0,
      totalBillableAmount: 0,
      entryCount: 0,
    }

    group.totalMinutes += entry.durationMinutes
    group.totalBillableMinutes += billableMinutes
    group.totalBillableAmount += amount
    group.entryCount += 1
    groupsByKey.set(key, group)
  }

  const byService: TimeEntrySummaryGroup[] = Array.from(groupsByKey.values())
    .sort((a, b) => b.totalMinutes - a.totalMinutes)

  return {
    totalMinutes,
    totalBillableMinutes,
    totalBillableAmount,
    byService,
  }
}
