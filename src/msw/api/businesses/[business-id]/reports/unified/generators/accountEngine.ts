import { sumBy } from 'lodash-es'

import { type LedgerAccountType, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'
import { type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import {
  groupByParentAccountId,
  ledgerAccountStore,
  resolveParentAccountId,
} from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import {
  accountMagnitude,
  entryStreamOptionsFromParams,
  isContraAccount,
  type ReportDateRange,
  textCell,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import {
  entriesInRange,
  type MockReportEntry,
} from '@fixtures/unifiedReports/deterministicAmounts'

export const accountsOfTypes = (types: readonly LedgerAccountType[]): SingleChartAccountType[] =>
  ledgerAccountStore.all().filter(account => types.includes(account.accountType.value))

export type AccountNode = {
  account: SingleChartAccountType
  children: AccountNode[]
}

export const buildAccountForest = (accounts: readonly SingleChartAccountType[]): AccountNode[] => {
  const idsInSet = new Set(accounts.map(account => account.accountId))
  const childrenByParentId = groupByParentAccountId(accounts)

  const toNode = (account: SingleChartAccountType): AccountNode => ({
    account,
    children: (childrenByParentId.get(account.accountId) ?? []).map(toNode),
  })

  return accounts
    .filter((account) => {
      const parentId = resolveParentAccountId(account)
      return parentId == null || !idsInSet.has(parentId)
    })
    .map(toNode)
}

export const collectLeafAccounts = (nodes: readonly AccountNode[]): SingleChartAccountType[] =>
  nodes.flatMap(node => node.children.length === 0
    ? [node.account]
    : collectLeafAccounts(node.children))

export const leafAccountsOfTypes = (types: readonly LedgerAccountType[]): SingleChartAccountType[] =>
  collectLeafAccounts(buildAccountForest(accountsOfTypes(types)))

export const accountStreamKey = (account: SingleChartAccountType): string =>
  account.stableName ?? account.accountId

export const accountSign = (account: SingleChartAccountType): number =>
  isContraAccount(account) ? -1 : 1

/*
 * Only leaf accounts have entry streams; parent rows are pure subtotals of
 * their descendants. Positive magnitudes on the account's normal side, so the
 * trial balance (which signs via the debit/credit column) reconciles here.
 */
export const accountMagnitudeEntriesInRange = (
  account: SingleChartAccountType,
  { startDate, endDate }: ReportDateRange,
  params: URLSearchParams,
): MockReportEntry[] => entriesInRange(
  accountStreamKey(account),
  startDate,
  endDate,
  entryStreamOptionsFromParams(params, accountMagnitude(account)),
)

/*
 * Entries carry the account's sign so contra accounts subtract from section
 * totals, in both summary cells and drill-down lines.
 */
export const accountEntriesInRange = (
  account: SingleChartAccountType,
  range: ReportDateRange,
  params: URLSearchParams,
): MockReportEntry[] => {
  const sign = accountSign(account)

  return accountMagnitudeEntriesInRange(account, range, params)
    .map(entry => ({ ...entry, amountCents: sign * entry.amountCents }))
}

export const accountActivityCents = (
  account: SingleChartAccountType,
  range: ReportDateRange,
  params: URLSearchParams,
): number => sumBy(accountEntriesInRange(account, range, params), entry => entry.amountCents)

export const nodeActivityCents = (
  node: AccountNode,
  range: ReportDateRange,
  params: URLSearchParams,
): number => node.children.length === 0
  ? accountActivityCents(node.account, range, params)
  : sumBy(node.children, child => nodeActivityCents(child, range, params))

export const sumActivityCents = (
  accounts: readonly SingleChartAccountType[],
  range: ReportDateRange,
  params: URLSearchParams,
): number => sumBy(accounts, account => accountActivityCents(account, range, params))

type ForestRowOptions = {
  nameColumnKey: string
  /** isLeaf lets callers put drill-downs on leaf amounts only; parent rows are subtotals with nothing to drill into. */
  valueCells: (node: AccountNode, isLeaf: boolean) => UnifiedReportRow['cells']
}

export const accountForestRows = (
  nodes: readonly AccountNode[],
  options: ForestRowOptions,
): UnifiedReportRow[] => nodes.map((node) => {
  const isLeaf = node.children.length === 0

  return {
    rowKey: node.account.accountId,
    cells: {
      [options.nameColumnKey]: textCell(node.account.name),
      ...options.valueCells(node, isLeaf),
    },
    ...(isLeaf ? {} : { rows: accountForestRows(node.children, options) }),
  }
})
