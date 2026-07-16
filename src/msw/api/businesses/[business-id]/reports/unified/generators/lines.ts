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
  numericColumn,
  parseDateRangeParams,
  parseEffectiveDateParam,
  type ReportDateRange,
  rowHeaderColumn,
  textCell,
  textColumn,
  trailingRangeFrom,
  unifiedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

const columns = () => [
  rowHeaderColumn('date', 'Date'),
  textColumn('type', 'Type'),
  textColumn('account', 'Account'),
  textColumn('description', 'Description'),
  numericColumn('amount', 'Amount'),
  numericColumn('balance', 'Balance'),
]

// date-controlled parents (balance sheet, trial balance) pass effective_date; range parents pass start/end.
const detailRange = (params: URLSearchParams): ReportDateRange =>
  params.get('start_date')
    ? parseDateRangeParams(params, trailingRangeFrom(parseEffectiveDateParam(params)))
    : trailingRangeFrom(parseEffectiveDateParam(params))

const resolveAccount = (params: URLSearchParams): SingleChartAccountType | undefined => {
  const accountId = params.get('account_id')
  if (accountId) return ledgerAccountStore.findById(accountId)
  return undefined
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

  rows.push({
    rowKey: 'total_line_item_detail',
    cells: {
      date: textCell('Total', { bold: true }),
      type: textCell('', { bold: true }),
      account: textCell('', { bold: true }),
      description: textCell('', { bold: true }),
      amount: currencyCell(runningBalance, { bold: true }),
      balance: currencyCell(runningBalance, { bold: true }),
    },
  })

  return unifiedReport(columns(), rows)
}
