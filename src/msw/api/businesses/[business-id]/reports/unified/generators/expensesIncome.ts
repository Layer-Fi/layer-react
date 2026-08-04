import { LedgerAccountType, type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'
import { type UnifiedReport, type UnifiedReportRow } from '@schemas/reports/unifiedReport'

import { customerStore } from '@msw/api/businesses/[business-id]/customers/store'
import {
  accountEntriesInRange,
  accountStreamKey,
  leafAccountsOfTypes,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/accountEngine'
import {
  type FlatGroup,
  flatGroupedReport,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/flatGrouped'
import {
  reportRangeFromParams,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/periods'
import {
  type ColumnHeaderKey,
  counterpartyName,
  currencyCell,
  dateCell,
  isoDate,
  type ReportDateRange,
  textCell,
  textCellOrEmpty,
  totalRowLabel,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/shared'
import { vendorStore } from '@msw/api/businesses/[business-id]/vendors/store'
import { hashString } from '@fixtures/unifiedReports/deterministicAmounts'

type Counterparty = { id: string, name: string | null }

type TransactionLineItem = {
  lineItemId: string
  date: Date
  accountId: string
  accountName: string
  counterparty: Counterparty | null
  description: string
  amountCents: number
}

// One in six line items has no counterparty, so grouped views exercise the Uncategorized group.
const counterpartyFor = (
  candidates: readonly Counterparty[],
  key: string,
): Counterparty | null => {
  if (candidates.length === 0) return null
  const hash = hashString(key)
  return hash % 6 === 0 ? null : candidates[hash % candidates.length]
}

const lineItemsFor = (
  accounts: readonly SingleChartAccountType[],
  candidates: readonly Counterparty[],
  range: ReportDateRange,
  params: URLSearchParams,
): TransactionLineItem[] => accounts
  .flatMap(account => accountEntriesInRange(account, range, params).map((entry, index) => {
    const lineItemId = `${accountStreamKey(account)}:${isoDate(entry.date)}:${index}`

    return {
      lineItemId,
      date: entry.date,
      accountId: account.accountId,
      accountName: account.name,
      counterparty: counterpartyFor(candidates, lineItemId),
      description: entry.description,
      amountCents: entry.amountCents,
    }
  }))
  .sort((a, b) => a.date.getTime() - b.date.getTime() || a.lineItemId.localeCompare(b.lineItemId))

const sumAmounts = (items: readonly TransactionLineItem[]) =>
  items.reduce((total, item) => total + item.amountCents, 0)

const groupsBy = <Key>(
  items: readonly TransactionLineItem[],
  keyOf: (item: TransactionLineItem) => Key,
  groupFor: (groupItems: readonly TransactionLineItem[]) => FlatGroup<TransactionLineItem>,
): Array<FlatGroup<TransactionLineItem>> => {
  const byKey = new Map<Key, TransactionLineItem[]>()
  items.forEach(item => byKey.set(keyOf(item), [...byKey.get(keyOf(item)) ?? [], item]))

  return [...byKey.values()].map(groupFor)
}

const byAccount = (items: readonly TransactionLineItem[]) =>
  groupsBy(items, item => item.accountId, groupItems => ({
    rowKey: `account:${groupItems[0].accountId}`,
    label: groupItems[0].accountName,
    isUncategorized: false,
    items: groupItems,
  }))

const byCounterparty = (
  dimension: 'vendor' | 'customer',
  unnamedLabel: string,
) => (items: readonly TransactionLineItem[]) =>
  groupsBy(items, item => item.counterparty?.id ?? null, (groupItems) => {
    const { counterparty } = groupItems[0]

    return counterparty
      ? {
        rowKey: `${dimension}:${counterparty.id}`,
        label: counterparty.name ?? unnamedLabel,
        isUncategorized: false,
        items: groupItems,
      }
      : { rowKey: `${dimension}:uncategorized`, label: 'Uncategorized', isUncategorized: true, items: groupItems }
  })

type TransactionReportOptions = {
  counterpartyColumn: 'vendor' | 'customer'
  items: readonly TransactionLineItem[]
  groupsFor?: (items: readonly TransactionLineItem[]) => Array<FlatGroup<TransactionLineItem>>
  total: { rowKey: string, label: string }
}

const transactionReport = (
  { counterpartyColumn, items, groupsFor, total }: TransactionReportOptions,
): UnifiedReport => {
  const columns: ColumnHeaderKey[] = ['date', 'account', counterpartyColumn, 'description', 'amount']

  const rowFor = (item: TransactionLineItem): UnifiedReportRow => ({
    rowKey: item.lineItemId,
    cells: {
      date: dateCell(item.date),
      account: textCell(item.accountName),
      [counterpartyColumn]: textCellOrEmpty(item.counterparty?.name),
      description: textCell(item.description),
      amount: currencyCell(item.amountCents),
    },
  })

  return flatGroupedReport({
    columns,
    measureColumn: 'amount',
    items,
    rowFor,
    subtotalCell: (groupItems, options) => currencyCell(sumAmounts(groupItems), options),
    groupsFor,
    total,
  })
}

const vendorCandidates = (): Counterparty[] =>
  vendorStore.all().map(vendor => ({ id: vendor.id, name: counterpartyName(vendor) }))

const customerCandidates = (): Counterparty[] =>
  customerStore.all().map(customer => ({ id: customer.id, name: counterpartyName(customer) }))

export const generateBusinessExpenses = (params: URLSearchParams): UnifiedReport => {
  const items = lineItemsFor(
    leafAccountsOfTypes([LedgerAccountType.Expense]),
    vendorCandidates(),
    reportRangeFromParams(params),
    params,
  )

  return transactionReport({
    counterpartyColumn: 'vendor',
    items,
    groupsFor: params.get('group_by') === 'VENDOR'
      ? byCounterparty('vendor', 'Unnamed Vendor')
      : params.get('group_by') === 'ACCOUNT' ? byAccount : undefined,
    total: { rowKey: 'expenses', label: totalRowLabel('Expenses') },
  })
}

export const generateBusinessIncome = (params: URLSearchParams): UnifiedReport => {
  const items = lineItemsFor(
    leafAccountsOfTypes([LedgerAccountType.Revenue]),
    customerCandidates(),
    reportRangeFromParams(params),
    params,
  )

  return transactionReport({
    counterpartyColumn: 'customer',
    items,
    groupsFor: params.get('group_by') === 'CUSTOMER'
      ? byCounterparty('customer', 'Unnamed Customer')
      : undefined,
    total: { rowKey: 'income', label: totalRowLabel('Income') },
  })
}
