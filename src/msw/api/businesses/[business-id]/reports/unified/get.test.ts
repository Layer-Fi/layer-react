import { Schema } from 'effect'
import { describe, expect, it } from 'vitest'

import { ReportGroupSchema } from '@schemas/reports/reportConfig'
import { type UnifiedReport, UnifiedReportSchema } from '@schemas/reports/unifiedReport'

import { unifiedReportGenerators } from '@msw/api/businesses/[business-id]/reports/unified/generators/registry'
import { defaultReportGroups } from '@fixtures/unifiedReports/reportConfig'

const encodeReport = Schema.encodeSync(UnifiedReportSchema)
const decodeReport = Schema.decodeUnknownSync(UnifiedReportSchema)
const roundTrip = (report: UnifiedReport) => decodeReport(encodeReport(report))

const YEAR = 2025
const CASH_ACCOUNT_ID = '00000009-0000-4000-8000-000000000001'

const params = (entries: Record<string, string>) => new URLSearchParams(entries)
const rangeParams = params({ start_date: `${YEAR}-01-01`, end_date: `${YEAR}-12-31` })
const effectiveParams = params({ effective_date: `${YEAR}-12-31` })

const currency = (report: UnifiedReport, rowKey: string, columnKey: string): number | null => {
  const cell = report.rows.find(row => row.rowKey === rowKey)?.cells[columnKey]
  return cell && cell.value.type === 'Currency' ? (cell.value.value as number) : null
}

const paramsForRoute = (route: string) => {
  if (route.includes('lines')) return params({ account_id: CASH_ACCOUNT_ID, start_date: `${YEAR}-01-01`, end_date: `${YEAR}-12-31` })
  if (route === 'tax/schedule-c') return params({ year: String(YEAR) })
  if (route.startsWith('balance-sheet') || route === 'trial-balance') return effectiveParams
  return rangeParams
}

describe('unified report config', () => {
  it('round-trips against ReportGroupSchema', () => {
    expect(() => Schema.encodeSync(Schema.Array(ReportGroupSchema))(defaultReportGroups)).not.toThrow()
    expect(defaultReportGroups.length).toBeGreaterThan(0)
  })
})

describe('unified report generators', () => {
  it.each(Object.keys(unifiedReportGenerators))('generates and round-trips %s', (route) => {
    const report = roundTrip(unifiedReportGenerators[route](paramsForRoute(route)))
    expect(report.columns.length).toBeGreaterThan(0)
  })

  it('scales profit-and-loss totals with the date range', () => {
    const year = unifiedReportGenerators['profit-and-loss'](rangeParams)
    const quarter = unifiedReportGenerators['profit-and-loss'](params({ start_date: `${YEAR}-01-01`, end_date: `${YEAR}-03-31` }))
    expect(Math.abs(currency(year, 'net_profit', 'total')!)).toBeGreaterThan(Math.abs(currency(quarter, 'net_profit', 'total')!))
  })

  it('emits a column per month plus a total when group_by=MONTH', () => {
    const monthly = unifiedReportGenerators['profit-and-loss'](params({ start_date: `${YEAR}-01-01`, end_date: `${YEAR}-12-31`, group_by: 'MONTH' }))
    // 1 row header + 12 months + total
    expect(monthly.columns.length).toBe(14)
  })

  it('reconciles line item detail totals with the parent cell', () => {
    const pnl = unifiedReportGenerators['profit-and-loss'](rangeParams)
    const leaf = findLeafWithConfig(pnl)
    expect(leaf).not.toBeNull()

    const detail = unifiedReportGenerators['profit-and-loss/lines'](params({
      account_id: leaf!.accountId, start_date: `${YEAR}-01-01`, end_date: `${YEAR}-12-31`,
    }))
    expect(currency(detail, 'total_line_item_detail', 'amount')).toBe(leaf!.total)
  })

  it('keeps trial balance debits equal to credits', () => {
    const tb = unifiedReportGenerators['trial-balance'](effectiveParams)
    expect(currency(tb, 'total_trial_balance', 'debit')).toBe(currency(tb, 'total_trial_balance', 'credit'))
  })

  it('holds the balance sheet identity assets = liabilities + equity', () => {
    const bs = unifiedReportGenerators['balance-sheet'](effectiveParams)
    expect(currency(bs, 'total_assets', 'balance')).toBe(currency(bs, 'total_liabilities_and_equity', 'balance'))
  })

  it('derives aging rows for AR and AP', () => {
    expect(unifiedReportGenerators['ar-aging'](effectiveParams).rows.length).toBeGreaterThan(1)
    expect(unifiedReportGenerators['ap-aging'](effectiveParams).rows.length).toBeGreaterThan(1)
  })
})

const findLeafWithConfig = (report: UnifiedReport): { accountId: string, total: number } | null => {
  for (const row of report.rows) {
    const nameCell = row.cells['name']
    if (nameCell?.reportConfig && row.rows === undefined) {
      const totalCell = row.cells['total']
      if (totalCell?.value.type === 'Currency') {
        return { accountId: nameCell.reportConfig.baseQueryParameters['account_id'], total: totalCell.value.value as number }
      }
    }
    if (row.rows) {
      const nested = findLeafWithConfig({ ...report, rows: row.rows })
      if (nested) return nested
    }
  }
  return null
}
