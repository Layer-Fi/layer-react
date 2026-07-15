import { differenceInDays } from 'date-fns'

import { type UnifiedReport, type UnifiedReportCell, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import { invoiceStore } from '@msw/api/businesses/[business-id]/invoices/store'
import {
  currencyCell,
  MOCK_REPORT_BUSINESS_ID,
  numericColumn,
  parseEffectiveDateParam,
  rowHeaderColumn,
  textCell,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import { allBills } from '@fixtures/bills/mocks'

const BUCKETS = [
  { key: 'current', label: 'Current', max: 30 },
  { key: 'days_31_60', label: '31–60 days', max: 60 },
  { key: 'days_61_90', label: '61–90 days', max: 90 },
  { key: 'days_over_90', label: '90+ days', max: Infinity },
] as const

const TOTAL_COLUMN_KEY = 'total'

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

  const columnTotals = BUCKETS.map(() => 0)

  const rowFor = (entityName: string, amounts: readonly number[]): UnifiedReportRow => {
    const cells: Record<string, UnifiedReportCell> = { [entityColumnKey]: textCell(entityName) }
    let rowTotal = 0

    BUCKETS.forEach((bucket, index) => {
      cells[bucket.key] = currencyCell(amounts[index])
      rowTotal += amounts[index]
      columnTotals[index] += amounts[index]
    })

    cells[TOTAL_COLUMN_KEY] = currencyCell(rowTotal)
    return { rowKey: entityName, cells }
  }

  const rows: UnifiedReportRow[] = [...byEntity.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([entityName, amounts]) => rowFor(entityName, amounts))

  const totalCells: Record<string, UnifiedReportCell> = { [entityColumnKey]: textCell('Total Outstanding', { bold: true }) }
  BUCKETS.forEach((bucket, index) => {
    totalCells[bucket.key] = currencyCell(columnTotals[index], { bold: true })
  })
  totalCells[TOTAL_COLUMN_KEY] = currencyCell(columnTotals.reduce((sum, value) => sum + value, 0), { bold: true })

  rows.push({ rowKey: `total_${entityColumnKey}_aging`, cells: totalCells })

  return {
    businessId: MOCK_REPORT_BUSINESS_ID,
    columns: [
      rowHeaderColumn(entityColumnKey, entityColumnLabel),
      ...BUCKETS.map(bucket => numericColumn(bucket.key, bucket.label)),
      numericColumn(TOTAL_COLUMN_KEY, 'Total'),
    ],
    rows,
  }
}

export const generateArAging = (params: URLSearchParams): UnifiedReport => {
  const items: AgingItem[] = invoiceStore.all()
    .filter(invoice => invoice.voidedAt == null && invoice.outstandingBalance > 0 && invoice.dueAt != null)
    .map(invoice => ({
      entityName: invoice.customer?.companyName
        ?? invoice.customer?.individualName
        ?? invoice.recipientName
        ?? 'Unknown customer',
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
