import { type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'
import { type UnifiedReport, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import { ledgerAccountStore } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import {
  accountEntriesInRange,
  accountMagnitudeEntriesInRange,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  currencyCell,
  dateCell,
  headerColumn,
  paddedCells,
  parseDateRangeParams,
  parseEffectiveDateParam,
  type ReportDateRange,
  textCell,
  totalRowKey,
  totalRowLabel,
  trailingRangeFrom,
  unifiedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

const COLUMN_KEYS = ['date', 'type', 'account', 'description', 'amount', 'balance'] as const

// The date header is the row header but is not pinned, unlike the summary reports'.
const columns = () => [
  headerColumn('date', { isRowHeader: true }),
  headerColumn('type'),
  headerColumn('account'),
  headerColumn('description'),
  headerColumn('amount'),
  headerColumn('balance'),
]

// Date-controlled parents (balance sheet, trial balance) pass effective_date; range parents pass start/end.
const detailRange = (params: URLSearchParams): ReportDateRange =>
  params.get('start_date')
    ? parseDateRangeParams(params, trailingRangeFrom(parseEffectiveDateParam(params)))
    : trailingRangeFrom(parseEffectiveDateParam(params))

const resolveAccount = (params: URLSearchParams): SingleChartAccountType | undefined => {
  const accountId = params.get('account_id')
  return accountId ? ledgerAccountStore.findById(accountId) : undefined
}

export const generateLineItemDetail = (params: URLSearchParams): UnifiedReport => {
  const account = resolveAccount(params)

  if (!account) {
    return unifiedReport(columns(), [])
  }

  // The trial balance shows unsigned magnitudes on the normal side, so its drill-down must match.
  const entries = params.get('unsigned') === 'true'
    ? accountMagnitudeEntriesInRange(account, detailRange(params), params)
    : accountEntriesInRange(account, detailRange(params), params)

  let runningBalance = 0
  const rows: UnifiedReportRow[] = entries.map((entry, index) => {
    runningBalance += entry.amountCents
    return {
      rowKey: `${account.accountId}-${index}`,
      cells: {
        date: dateCell(entry.date),
        type: textCell(entry.entryType),
        account: textCell(account.name),
        description: textCell(entry.description),
        amount: currencyCell(entry.amountCents),
        balance: currencyCell(runningBalance),
      },
    }
  })

  // The backend omits the total row entirely when the drill-down has no lines.
  if (rows.length > 0) {
    rows.push({
      rowKey: totalRowKey('line_item_detail'),
      cells: paddedCells(COLUMN_KEYS, {
        date: textCell(totalRowLabel(account.name), { bold: true }),
        amount: currencyCell(runningBalance, { bold: true }),
      }),
    })
  }

  return unifiedReport(columns(), rows)
}
