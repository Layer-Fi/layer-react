import { differenceInDays } from 'date-fns'
import { sum } from 'lodash-es'

import { type UnifiedReport } from '@schemas/reports/unifiedReport'
import { getInvoiceCustomerName } from '@utils/customerVendor'

import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import { parseEffectiveDateParam } from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import { generateTableReport } from '@msw/api/businesses/[business-id]/reports/unified/generators/tableReport'
import { allBills } from '@fixtures/bills/mocks'

const BUCKETS = [
  { key: 'current', label: 'Current', max: 30 },
  { key: 'days_31_60', label: '31–60 days', max: 60 },
  { key: 'days_61_90', label: '61–90 days', max: 90 },
  { key: 'days_over_90', label: '90+ days', max: Infinity },
] as const

type AgingItem = { entityName: string, dueAt: Date, amountCents: number }

const bucketIndexForDaysPastDue = (daysPastDue: number) =>
  BUCKETS.findIndex(bucket => daysPastDue <= bucket.max)

const buildAgingReport = (
  entityColumnKey: string,
  entityColumnLabel: string,
  items: readonly AgingItem[],
  effectiveDate: Date,
): UnifiedReport => {
  const byEntity = new Map<string, number[]>()

  items.forEach((item) => {
    const bucketIndex = Math.max(0, bucketIndexForDaysPastDue(differenceInDays(effectiveDate, item.dueAt)))
    const amounts = byEntity.get(item.entityName) ?? BUCKETS.map(() => 0)
    amounts[bucketIndex] += item.amountCents
    byEntity.set(item.entityName, amounts)
  })

  const entities = [...byEntity.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([entityName, amounts]) => ({ entityName, amounts }))

  return generateTableReport({
    rowHeader: { columnKey: entityColumnKey, displayName: entityColumnLabel, label: ({ entityName }) => entityName },
    rowKey: ({ entityName }) => entityName,
    items: entities,
    valueColumns: [
      ...BUCKETS.map((bucket, index) => ({
        columnKey: bucket.key,
        displayName: bucket.label,
        value: ({ amounts }: (typeof entities)[number]) => amounts[index],
      })),
      {
        columnKey: 'total',
        displayName: 'Total',
        value: ({ amounts }) => sum(amounts),
      },
    ],
    total: { rowKey: `total_${entityColumnKey}_aging`, label: 'Total Outstanding' },
  })
}

export const generateArAging = (params: URLSearchParams): UnifiedReport => {
  const items: AgingItem[] = invoiceStore.all()
    .filter(invoice => invoice.voidedAt == null && invoice.outstandingBalance > 0 && invoice.dueAt != null)
    .map(invoice => ({
      entityName: getInvoiceCustomerName(invoice),
      dueAt: invoice.dueAt as Date,
      amountCents: invoice.outstandingBalance,
    }))

  return buildAgingReport('customer', 'Customer', items, parseEffectiveDateParam(params))
}

export const generateApAging = (params: URLSearchParams): UnifiedReport => {
  const items: AgingItem[] = allBills.map(bill => ({
    entityName: bill.vendorName,
    dueAt: bill.dueAt,
    amountCents: bill.outstandingBalanceCents,
  }))

  return buildAgingReport('vendor', 'Vendor', items, parseEffectiveDateParam(params))
}
