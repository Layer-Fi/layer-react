import { sumBy } from 'lodash-es'

import { LedgerAccountType } from '@schemas/generalLedger/ledgerAccount'
import { type UnifiedReport, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

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
  linesReportConfig,
  numericColumn,
  parseEffectiveDateParam,
  rowHeaderColumn,
  textCell,
  unifiedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

const ACCOUNT_COLUMN_KEY = 'account'
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

const sideCells = (magnitude: number, onDebit: boolean) => ({
  [DEBIT_COLUMN_KEY]: onDebit ? currencyCell(magnitude) : emptyCell(),
  [CREDIT_COLUMN_KEY]: onDebit ? emptyCell() : currencyCell(magnitude),
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

  // Drill-downs bake the same accumulation window as the parent so detail totals match the account's balance.
  // unsigned keeps detail rows on the account's normal side, matching the magnitude shown in the debit/credit cell.
  const baseParams = { ...detailBaseParams(balanceSheetRange(effectiveDate), params), unsigned: 'true' }

  const accountRow = (
    account: (typeof scored)[number]['account'],
    magnitude: number,
    onDebit: boolean,
    drillDown: boolean = true,
  ): UnifiedReportRow => ({
    rowKey: account.accountId,
    cells: {
      [ACCOUNT_COLUMN_KEY]: textCell(account.name, {
        reportConfig: drillDown ? linesReportConfig(LINES_ROUTE, account, [], baseParams) : undefined,
      }),
      ...sideCells(magnitude, onDebit),
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
    rowKey: 'total_trial_balance',
    cells: {
      [ACCOUNT_COLUMN_KEY]: textCell('Total', { bold: true }),
      [DEBIT_COLUMN_KEY]: currencyCell(totalDebit, { bold: true }),
      [CREDIT_COLUMN_KEY]: currencyCell(totalCredit, { bold: true }),
    },
  })

  return unifiedReport(
    [
      rowHeaderColumn(ACCOUNT_COLUMN_KEY, 'Account'),
      numericColumn(DEBIT_COLUMN_KEY, 'Debit'),
      numericColumn(CREDIT_COLUMN_KEY, 'Credit'),
    ],
    rows,
  )
}
