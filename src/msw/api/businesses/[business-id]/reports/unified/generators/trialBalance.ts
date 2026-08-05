import { sumBy } from 'lodash-es'

import { Pinning } from '@internal-types/utility/table'
import { LedgerAccountType } from '@schemas/features/generalLedger/ledgerAccountType'
import { type ReportConfig } from '@schemas/features/unifiedReports/reportConfig'
import { type UnifiedReport, type UnifiedReportRow } from '@schemas/features/unifiedReports/unifiedReport'

import { leafAccountsOfTypes } from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  accumulatedMagnitudeCents,
  balanceSheetRange,
  isDebitNormal,
  OPENING_BALANCE_EQUITY_STABLE_NAME,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/balances'
import {
  currencyCell,
  detailBaseParams,
  emptyCell,
  headerColumn,
  linesReportConfig,
  parseEffectiveDateParam,
  textCell,
  totalRowKey,
  unifiedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

const DEBIT_COLUMN_KEY = 'debit'
const CREDIT_COLUMN_KEY = 'credit'

const LINES_ROUTE = 'trial-balance/lines'

const ALL_TYPES = [
  LedgerAccountType.Asset,
  LedgerAccountType.Liability,
  LedgerAccountType.Equity,
  LedgerAccountType.Revenue,
  LedgerAccountType.Expense,
] as const

const sideCells = (magnitude: number, onDebit: boolean, reportConfig?: ReportConfig) => ({
  [DEBIT_COLUMN_KEY]: onDebit ? currencyCell(magnitude, { reportConfig }) : emptyCell(),
  [CREDIT_COLUMN_KEY]: onDebit ? emptyCell() : currencyCell(magnitude, { reportConfig }),
})

export const generateTrialBalance = (params: URLSearchParams): UnifiedReport => {
  const effectiveDate = parseEffectiveDateParam(params)
  const leaves = leafAccountsOfTypes(ALL_TYPES)

  const openingBalanceEquity = leaves.find(a => a.stableName === OPENING_BALANCE_EQUITY_STABLE_NAME)
  const scored = leaves
    .filter(account => account !== openingBalanceEquity)
    .map(account => ({ account, magnitude: accumulatedMagnitudeCents(account, effectiveDate, params) }))

  const debitSum = sumBy(scored.filter(({ account }) => isDebitNormal(account)), ({ magnitude }) => magnitude)
  const creditSum = sumBy(scored.filter(({ account }) => !isDebitNormal(account)), ({ magnitude }) => magnitude)

  // Opening balance equity plugs the report so total debits equal total credits.
  const plugMagnitude = Math.abs(debitSum - creditSum)
  const plugOnDebit = debitSum < creditSum

  // Bake the parent's window, and keep detail unsigned to match the debit/credit magnitude shown.
  const baseParams = { ...detailBaseParams(balanceSheetRange(effectiveDate), params), unsigned: 'true' }

  const accountRow = (
    account: (typeof scored)[number]['account'],
    magnitude: number,
    onDebit: boolean,
    drillDown: boolean = true,
  ): UnifiedReportRow => ({
    rowKey: account.stableName ?? account.accountId,
    cells: {
      account: textCell(account.name),
      account_type: textCell(account.accountType.displayName),
      ...sideCells(magnitude, onDebit, drillDown ? linesReportConfig(LINES_ROUTE, account, [], baseParams) : undefined),
    },
  })

  const rows: UnifiedReportRow[] = scored.map(({ account, magnitude }) =>
    accountRow(account, magnitude, isDebitNormal(account)))

  // Opening balance equity displays the plug, not its own stream, so it has no drill-down.
  if (openingBalanceEquity) {
    rows.push(accountRow(openingBalanceEquity, plugMagnitude, plugOnDebit, false))
  }

  const totalDebit = debitSum + (plugOnDebit ? plugMagnitude : 0)
  const totalCredit = creditSum + (plugOnDebit ? 0 : plugMagnitude)

  rows.push({
    rowKey: totalRowKey('trial_balance'),
    cells: {
      account: textCell('Total', { bold: true }),
      account_type: emptyCell(),
      [DEBIT_COLUMN_KEY]: currencyCell(totalDebit, { bold: true }),
      [CREDIT_COLUMN_KEY]: currencyCell(totalCredit, { bold: true }),
    },
  })

  return unifiedReport(
    [
      headerColumn('account', { isRowHeader: true, pinning: Pinning.Left }),
      headerColumn('account_type'),
      headerColumn('debit'),
      headerColumn('credit'),
    ],
    rows,
  )
}
