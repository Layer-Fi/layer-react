import { Pinning, type UnifiedReport } from '@schemas/reports/unifiedReport'

import { monthsInRange, reportRangeFromParams } from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import { generateTableReport } from '@msw/api/businesses/[business-id]/reports/unified/generators/tableReport'
import { hashString } from '@fixtures/unifiedReports/deterministicAmounts'

const TIME_TRACKING_CUSTOMERS = ['Soylent Corp', 'Initech', 'Oscorp Industries', 'Wayne Enterprises', 'Internal']
const BILLABLE_RATE_CENTS_PER_HOUR = 12_500

export const generateTimeTracking = (params: URLSearchParams): UnifiedReport => {
  const monthCount = Math.max(1, monthsInRange(reportRangeFromParams(params)).length)

  const customers = TIME_TRACKING_CUSTOMERS.map((customer) => {
    const seed = hashString(`time_tracking:${customer}`)
    const entries = (4 + (seed % 6)) * monthCount
    const minutes = (90 + (seed % 240)) * entries

    return { customer, entries, minutes, billable: Math.round((minutes / 60) * BILLABLE_RATE_CENTS_PER_HOUR) }
  })

  return generateTableReport({
    rowHeader: { columnKey: 'customer', displayName: 'Customer', label: ({ customer }) => customer },
    rowKey: ({ customer }) => customer,
    items: customers,
    valueColumns: [
      { columnKey: 'entries', displayName: 'Entries', cellType: 'decimal', value: ({ entries }) => entries },
      { columnKey: 'duration', displayName: 'Duration', cellType: 'duration', value: ({ minutes }) => minutes },
      { columnKey: 'billable_amount', displayName: 'Billable', value: ({ billable }) => billable, pinning: Pinning.Right },
    ],
    total: { rowKey: 'total_time_tracking', label: 'Total' },
  })
}
