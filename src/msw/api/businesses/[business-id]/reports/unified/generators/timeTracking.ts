import { getLocalTimeZone } from '@internationalized/date'

import { type TimeEntry } from '@schemas/features/timeTracking/timeEntry'
import { type UnifiedReport } from '@schemas/features/unifiedReports/unifiedReport'

import {
  type FlatGroup,
  flatGroupedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/flatGrouped'
import { reportRangeFromParams } from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import {
  type ColumnHeaderKey,
  counterpartyName,
  dateCell,
  durationCell,
  textCellOrEmpty,
  totalRowLabel,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import { timeEntryStore } from '@msw/api/businesses/[business-id]/time-tracking/time-entries/store'

const COLUMNS: ColumnHeaderKey[] = ['date', 'service', 'customer', 'description', 'duration']

// Range bounds arrive as local dates, so the calendar date resolves in the same zone.
const entryDate = (entry: TimeEntry) => entry.date.toDate(getLocalTimeZone())

const totalMinutes = (entries: readonly TimeEntry[]) =>
  entries.reduce((total, entry) => total + entry.durationMinutes, 0)

const groupsBy = <Key>(
  entries: readonly TimeEntry[],
  keyOf: (entry: TimeEntry) => Key,
  groupFor: (groupEntries: readonly TimeEntry[]) => FlatGroup<TimeEntry>,
): Array<FlatGroup<TimeEntry>> => {
  const byKey = new Map<Key, TimeEntry[]>()
  entries.forEach(entry => byKey.set(keyOf(entry), [...byKey.get(keyOf(entry)) ?? [], entry]))

  return [...byKey.values()].map(groupFor)
}

const byCustomer = (entries: readonly TimeEntry[]) =>
  groupsBy(entries, entry => entry.customer?.id ?? null, (groupEntries) => {
    const { customer } = groupEntries[0]

    return customer
      ? {
        rowKey: `customer:${customer.id}`,
        label: counterpartyName(customer) ?? 'Unnamed Customer',
        isUncategorized: false,
        items: groupEntries,
      }
      : { rowKey: 'customer:uncategorized', label: 'Uncategorized', isUncategorized: true, items: groupEntries }
  })

const byService = (entries: readonly TimeEntry[]) =>
  groupsBy(entries, entry => entry.service?.id ?? null, (groupEntries) => {
    const { service } = groupEntries[0]

    return service
      ? {
        rowKey: `service:${service.id}`,
        label: service.name ?? 'Uncategorized',
        isUncategorized: false,
        items: groupEntries,
      }
      : { rowKey: 'service:uncategorized', label: 'Uncategorized', isUncategorized: true, items: groupEntries }
  })

export const generateTimeTracking = (params: URLSearchParams): UnifiedReport => {
  const { startDate, endDate } = reportRangeFromParams(params)

  const entries = timeEntryStore.all()
    .filter(entry => entry.status !== 'ACTIVE')
    .filter(entry => entryDate(entry) >= startDate && entryDate(entry) <= endDate)
    .sort((a, b) => entryDate(a).getTime() - entryDate(b).getTime() || a.id.localeCompare(b.id))

  const groupBy = params.get('group_by')

  return flatGroupedReport({
    columns: COLUMNS,
    measureColumn: 'duration',
    items: entries,
    rowFor: entry => ({
      rowKey: entry.id,
      cells: {
        date: dateCell(entryDate(entry)),
        service: textCellOrEmpty(entry.service?.name),
        customer: textCellOrEmpty(entry.customer ? counterpartyName(entry.customer) : null),
        description: textCellOrEmpty(entry.description),
        duration: durationCell(entry.durationMinutes),
      },
    }),
    subtotalCell: (groupEntries, options) => durationCell(totalMinutes(groupEntries), options),
    groupsFor: groupBy === 'CUSTOMER' ? byCustomer : groupBy === 'SERVICE' ? byService : undefined,
    total: { rowKey: 'time_tracking', label: totalRowLabel('Time Tracking') },
  })
}
