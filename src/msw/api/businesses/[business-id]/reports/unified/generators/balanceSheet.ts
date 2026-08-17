import { format } from 'date-fns'
import { sumBy } from 'lodash-es'

import { type SingleChartAccountType } from '@schemas/features/generalLedger/chartOfAccounts'
import { LedgerAccountType } from '@schemas/features/generalLedger/ledgerAccountType'
import { type UnifiedReport } from '@schemas/features/unifiedReports/unifiedReport'

import {
  type AccountNode,
  accountsOfTypes,
  buildAccountForest,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  balanceSheetLeafAccounts,
  balanceSheetRange,
  cumulativeNetIncomeCents,
  leafBalanceCents,
  OPENING_BALANCE_EQUITY_STABLE_NAME,
  RETAINED_EARNINGS_STABLE_NAME,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/balances'
import {
  lineItemTreeReport,
  type ReportLineItem,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/lineItemTree'
import { TOTAL_COLUMN_KEY } from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import {
  detailBaseParams,
  linesReportConfig,
  numericColumn,
  parseEffectiveDateParam,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'

const LINES_ROUTE = 'balance-sheet/lines'

// The backend prefixes its synthetic balance-sheet row keys; account rows keep their stable name.
const syntheticRowKey = (name: string) => `balance-sheet-${name}`

// Subtypes whose backend SubtypeGroup is current: ACCOUNTS_RECEIVABLE, BANK,
// PAYMENT_CLEARING, or OTHER_CURRENT_ASSETS. Everything else is non-current.
const CURRENT_ASSET_SUBTYPES = [
  'ACCOUNTS_RECEIVABLE', 'BANK_ACCOUNTS', 'CASH', 'CURRENT_ASSET', 'INVENTORY',
  'PAYMENT_PROCESSOR_CLEARING_ACCOUNT', 'PREPAID_EXPENSES', 'UNDEPOSITED_FUNDS',
]
// Subtypes whose backend SubtypeGroup is current: ACCOUNTS_PAYABLE, CREDIT_CARD,
// or OTHER_CURRENT_LIABILITIES. LONG_TERM_LIABILITY subtypes are non-current.
const CURRENT_LIABILITY_SUBTYPES = [
  'ACCOUNTS_PAYABLE', 'CREDIT_CARD', 'LINE_OF_CREDIT', 'OTHER_CURRENT_LIABILITY',
  'OTHER_TAXES_PAYABLE', 'PAYROLL_LIABILITY', 'REFUND_LIABILITIES', 'SALES_TAXES_PAYABLE',
  'TIPS', 'UNDEPOSITED_OUTFLOWS', 'UNEARNED_REVENUE',
]

type BalanceByAccountId = ReadonlyMap<string, number>

const subtreeTotal = (node: AccountNode, balances: BalanceByAccountId): number =>
  node.children.length === 0
    ? balances.get(node.account.accountId) ?? 0
    : sumBy(node.children, child => subtreeTotal(child, balances))

const sumForType = (
  leaves: readonly SingleChartAccountType[],
  type: LedgerAccountType,
  balances: BalanceByAccountId,
) => sumBy(
  leaves.filter(account => account.accountType.value === type),
  account => balances.get(account.accountId) ?? 0,
)

export const generateBalanceSheet = (params: URLSearchParams): UnifiedReport => {
  const effectiveDate = parseEffectiveDateParam(params)
  const leaves = balanceSheetLeafAccounts()

  const balances = new Map<string, number>(
    leaves.map(account => [account.accountId, leafBalanceCents(account, effectiveDate, params)]),
  )

  const retainedEarnings = leaves.find(a => a.stableName === RETAINED_EARNINGS_STABLE_NAME)
  const openingBalanceEquity = leaves.find(a => a.stableName === OPENING_BALANCE_EQUITY_STABLE_NAME)
  if (retainedEarnings) balances.set(retainedEarnings.accountId, cumulativeNetIncomeCents(effectiveDate, params))

  const assetsTotal = sumForType(leaves, LedgerAccountType.Asset, balances)
  const liabilitiesTotal = sumForType(leaves, LedgerAccountType.Liability, balances)

  // Opening balance equity plugs Assets = Liabilities + Equity, so it carries no stream of its own.
  if (openingBalanceEquity) {
    balances.set(openingBalanceEquity.accountId, 0)
    balances.set(
      openingBalanceEquity.accountId,
      assetsTotal - liabilitiesTotal - sumForType(leaves, LedgerAccountType.Equity, balances),
    )
  }

  const baseParams = detailBaseParams(balanceSheetRange(effectiveDate), params)
  const pluggedIds = new Set([retainedEarnings?.accountId, openingBalanceEquity?.accountId])

  const accountLineItem = (node: AccountNode): ReportLineItem => ({
    name: node.account.stableName ?? node.account.accountId,
    displayName: node.account.name,
    amounts: { [TOTAL_COLUMN_KEY]: subtreeTotal(node, balances) },
    ...(node.children.length === 0 && !pluggedIds.has(node.account.accountId) && {
      reportConfig: linesReportConfig(LINES_ROUTE, node.account, [], baseParams),
    }),
    childItems: node.children.map(accountLineItem),
  })

  const subtypeGroup = (
    name: string,
    displayName: string,
    type: LedgerAccountType,
    currentSubtypes: readonly string[],
    wantCurrent: boolean,
  ): ReportLineItem => {
    const forest = buildAccountForest(accountsOfTypes([type]))
      .flatMap(root => root.children)
      .filter(node => currentSubtypes.includes(node.account.accountSubtype?.value ?? '') === wantCurrent)

    return {
      name: syntheticRowKey(name),
      displayName,
      amounts: { [TOTAL_COLUMN_KEY]: sumBy(forest, node => subtreeTotal(node, balances)) },
      childItems: forest.map(accountLineItem),
    }
  }

  const assets = [
    subtypeGroup('CURRENT_ASSETS', 'Current Assets', LedgerAccountType.Asset, CURRENT_ASSET_SUBTYPES, true),
    subtypeGroup('NON_CURRENT_ASSETS', 'Non-current Assets', LedgerAccountType.Asset, CURRENT_ASSET_SUBTYPES, false),
  ]
  const liabilities = [
    subtypeGroup('CURRENT_LIABILITIES', 'Current Liabilities', LedgerAccountType.Liability, CURRENT_LIABILITY_SUBTYPES, true),
    subtypeGroup('NON_CURRENT_LIABILITIES', 'Non-current Liabilities', LedgerAccountType.Liability, CURRENT_LIABILITY_SUBTYPES, false),
  ]
  const equities: ReportLineItem = {
    name: syntheticRowKey('EQUITIES'),
    displayName: 'Equities',
    amounts: { [TOTAL_COLUMN_KEY]: sumForType(leaves, LedgerAccountType.Equity, balances) },
    childItems: buildAccountForest(accountsOfTypes([LedgerAccountType.Equity]))
      .flatMap(root => root.children)
      .map(accountLineItem),
  }

  const sumOf = (items: readonly ReportLineItem[]) =>
    sumBy(items, item => item.amounts[TOTAL_COLUMN_KEY] ?? 0)

  return lineItemTreeReport([numericColumn(TOTAL_COLUMN_KEY, format(effectiveDate, 'MMMM d, yyyy'))], [
    {
      name: syntheticRowKey('ASSETS'),
      displayName: 'Assets',
      amounts: { [TOTAL_COLUMN_KEY]: sumOf(assets) },
      childItems: assets,
    },
    {
      name: syntheticRowKey('LIABILITIES_AND_EQUITY'),
      displayName: 'Liabilities and Equity',
      amounts: { [TOTAL_COLUMN_KEY]: sumOf(liabilities) + (equities.amounts[TOTAL_COLUMN_KEY] ?? 0) },
      childItems: [
        {
          name: syntheticRowKey('LIABILITIES'),
          displayName: 'Liabilities',
          amounts: { [TOTAL_COLUMN_KEY]: sumOf(liabilities) },
          childItems: liabilities,
        },
        equities,
      ],
    },
  ])
}
