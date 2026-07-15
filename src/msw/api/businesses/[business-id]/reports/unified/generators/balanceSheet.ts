import { LedgerAccountType, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'
import { ReportControl } from '@schemas/reports/reportConfig'
import { Pinning, type UnifiedReport, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import {
  type AccountNode,
  accountsOfTypes,
  buildAccountForest,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  balanceSheetLeafAccounts,
  cumulativeNetIncomeCents,
  leafBalanceCents,
  OPENING_BALANCE_EQUITY_STABLE_NAME,
  RETAINED_EARNINGS_STABLE_NAME,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/balances'
import {
  currencyCell,
  linesReportConfig,
  MOCK_REPORT_BUSINESS_ID,
  numericColumn,
  parseEffectiveDateParam,
  rowHeaderColumn,
  textCell,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

const NAME_COLUMN_KEY = 'name'
const BALANCE_COLUMN_KEY = 'balance'

const LINES_ROUTE = 'balance-sheet/lines'
const LINES_CONTROLS = [ReportControl.Date] as const

type BalanceByAccountId = ReadonlyMap<string, number>

const accountRow = (
  node: AccountNode,
  balances: BalanceByAccountId,
): UnifiedReportRow => {
  const isLeaf = node.children.length === 0
  const amount = isLeaf
    ? balances.get(node.account.accountId) ?? 0
    : subtreeTotal(node, balances)

  return {
    rowKey: node.account.accountId,
    cells: {
      [NAME_COLUMN_KEY]: textCell(node.account.name, {
        reportConfig: isLeaf ? linesReportConfig(LINES_ROUTE, node.account, LINES_CONTROLS) : undefined,
      }),
      [BALANCE_COLUMN_KEY]: currencyCell(amount),
    },
    ...(isLeaf ? {} : { rows: node.children.map(child => accountRow(child, balances)) }),
  }
}

const subtreeTotal = (node: AccountNode, balances: BalanceByAccountId): number =>
  node.children.length === 0
    ? balances.get(node.account.accountId) ?? 0
    : node.children.reduce((total, child) => total + subtreeTotal(child, balances), 0)

const sectionTotalRow = (rowKey: string, label: string, amount: number): UnifiedReportRow => ({
  rowKey,
  cells: {
    [NAME_COLUMN_KEY]: textCell(label, { bold: true }),
    [BALANCE_COLUMN_KEY]: currencyCell(amount, { bold: true }),
  },
})

// Sums leaf balances only; parent rows are subtotals, so summing them too would double-count.
const sumForType = (
  leaves: readonly SingleChartAccountType[],
  type: LedgerAccountType,
  balances: BalanceByAccountId,
) => leaves
  .filter(account => account.accountType.value === type)
  .reduce((total, account) => total + (balances.get(account.accountId) ?? 0), 0)

export const generateBalanceSheet = (params: URLSearchParams): UnifiedReport => {
  const effectiveDate = parseEffectiveDateParam(params)
  const leaves = balanceSheetLeafAccounts()

  const balances = new Map<string, number>(
    leaves.map(account => [account.accountId, leafBalanceCents(account, effectiveDate, params)]),
  )

  // Retained earnings mirrors net income, and opening balance equity plugs Assets = Liabilities + Equity.
  const retainedEarnings = leaves.find(a => a.stableName === RETAINED_EARNINGS_STABLE_NAME)
  const openingBalanceEquity = leaves.find(a => a.stableName === OPENING_BALANCE_EQUITY_STABLE_NAME)
  if (retainedEarnings) balances.set(retainedEarnings.accountId, cumulativeNetIncomeCents(effectiveDate, params))

  const assetsTotal = sumForType(leaves, LedgerAccountType.Asset, balances)
  const liabilitiesTotal = sumForType(leaves, LedgerAccountType.Liability, balances)

  if (openingBalanceEquity) balances.set(openingBalanceEquity.accountId, 0)
  const equityBeforePlug = sumForType(leaves, LedgerAccountType.Equity, balances)
  if (openingBalanceEquity) {
    balances.set(openingBalanceEquity.accountId, assetsTotal - liabilitiesTotal - equityBeforePlug)
  }

  const equityTotal = sumForType(leaves, LedgerAccountType.Equity, balances)

  const forestFor = (type: LedgerAccountType) =>
    buildAccountForest(accountsOfTypes([type]))

  const rows: UnifiedReportRow[] = [
    ...forestFor(LedgerAccountType.Asset).map(node => accountRow(node, balances)),
    sectionTotalRow('total_assets', 'Total Assets', assetsTotal),
    ...forestFor(LedgerAccountType.Liability).map(node => accountRow(node, balances)),
    sectionTotalRow('total_liabilities', 'Total Liabilities', liabilitiesTotal),
    ...forestFor(LedgerAccountType.Equity).map(node => accountRow(node, balances)),
    sectionTotalRow('total_equity', 'Total Equity', equityTotal),
    sectionTotalRow('total_liabilities_and_equity', 'Total Liabilities & Equity', liabilitiesTotal + equityTotal),
  ]

  return {
    businessId: MOCK_REPORT_BUSINESS_ID,
    columns: [
      rowHeaderColumn(NAME_COLUMN_KEY, 'Account'),
      numericColumn(BALANCE_COLUMN_KEY, 'Balance', Pinning.Right),
    ],
    rows,
  }
}
