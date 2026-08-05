import { differenceInDays } from 'date-fns'
import { sum } from 'lodash-es'

import { Pinning } from '@internal-types/utility/table'
import { type UnifiedReport, type UnifiedReportRow } from '@schemas/unifiedReports/unifiedReport'
import { getInvoiceCustomerName } from '@utils/features/customerVendor/customer'

import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import {
  currencyCell,
  headerColumn,
  numericColumn,
  parseEffectiveDateParam,
  textCell,
  totalRowKey,
  unifiedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

// Column keys and labels come from the backend's AgingBucket enum.
const BUCKETS = [
  { key: 'current_0_30', label: '0-30', max: 30 },
  { key: 'days_31_60', label: '31-60', max: 60 },
  { key: 'days_61_90', label: '61-90', max: 90 },
  { key: 'days_90_plus', label: '90+', max: Infinity },
] as const

type AgingItem = { entityKey: string, entityName: string, dueAt: Date, amountCents: number }

const bucketIndexForDaysPastDue = (daysPastDue: number) =>
  Math.max(0, BUCKETS.findIndex(bucket => daysPastDue <= bucket.max))

const buildAgingReport = (
  entityColumn: 'customer' | 'vendor',
  totalRowName: string,
  items: readonly AgingItem[],
  effectiveDate: Date,
): UnifiedReport => {
  const byEntity = new Map<string, { entityName: string, amounts: number[] }>()

  items.forEach((item) => {
    const entity = byEntity.get(item.entityKey) ?? { entityName: item.entityName, amounts: BUCKETS.map(() => 0) }
    entity.amounts[bucketIndexForDaysPastDue(differenceInDays(effectiveDate, item.dueAt))] += item.amountCents
    byEntity.set(item.entityKey, entity)
  })

  const entities = [...byEntity.entries()].sort(([, a], [, b]) => a.entityName.localeCompare(b.entityName))

  const entityRow = (
    rowKey: string,
    label: string,
    amounts: readonly number[],
    bold?: boolean,
  ): UnifiedReportRow => ({
    rowKey,
    cells: {
      [entityColumn]: textCell(label, { bold }),
      ...Object.fromEntries(BUCKETS.map((bucket, index) => [bucket.key, currencyCell(amounts[index], { bold })])),
      total: currencyCell(sum(amounts), { bold }),
    },
  })

  const bucketTotals = BUCKETS.map((_, index) => sum(entities.map(([, entity]) => entity.amounts[index])))

  return unifiedReport(
    [
      headerColumn(entityColumn, { isRowHeader: true, pinning: Pinning.Left }),
      ...BUCKETS.map(bucket => numericColumn(bucket.key, bucket.label)),
      headerColumn('total'),
    ],
    [
      ...entities.map(([entityKey, entity]) => entityRow(entityKey, entity.entityName, entity.amounts)),
      entityRow(totalRowKey(totalRowName), 'Total Outstanding', bucketTotals, true),
    ],
  )
}

export const generateArAging = (params: URLSearchParams): UnifiedReport => {
  const items: AgingItem[] = invoiceStore.all()
    .filter(invoice => invoice.voidedAt == null && invoice.outstandingBalance > 0 && invoice.dueAt != null)
    .map(invoice => ({
      entityKey: invoice.customer?.id ?? 'unassigned',
      entityName: getInvoiceCustomerName(invoice) ?? 'Unnamed Customer',
      dueAt: invoice.dueAt as Date,
      amountCents: invoice.outstandingBalance,
    }))

  return buildAgingReport('customer', 'ar_aging', items, parseEffectiveDateParam(params))
}
