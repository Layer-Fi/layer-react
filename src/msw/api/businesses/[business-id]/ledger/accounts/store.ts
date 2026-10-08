import type { AccountIdentifier } from '@schemas/common/accountIdentifier'
import { type SingleChartAccountType } from '@schemas/features/generalLedger/chartOfAccounts'
import { LedgerAccountType } from '@schemas/features/generalLedger/ledgerAccountType'
import { accountIdentifierIsForCategory } from '@utils/features/categorization/categories'

import { PARENT_BY_STABLE_NAME } from '@fixtures/chartOfAccounts/constants'
import { chartOfAccounts } from '@fixtures/generated/chartOfAccounts.gen'
import { accountCategorizationFields } from '@msw/api/businesses/[business-id]/ledger/accounts/accountCategorizationFields'
import { ledgerEntryStore } from '@msw/api/businesses/[business-id]/ledger/entries/store'
import { createMockStore } from '@msw/utils/createMockStore'

export const ledgerAccountStore = createMockStore(
  () => chartOfAccounts,
  { getId: account => account.accountId },
)

export const accountParentStore = createMockStore<{ id: string, parentAccountId: string }>(() => [])

export const findAccountByIdentifier = (identifier: AccountIdentifier) =>
  ledgerAccountStore.all().find(account => accountIdentifierIsForCategory(identifier, {
    type: 'AccountNested',
    ...accountCategorizationFields(account),
  }))

export const resolveParentAccountId = (account: SingleChartAccountType): string | null => {
  const runtimeParent = accountParentStore.findById(account.accountId)
  if (runtimeParent) return runtimeParent.parentAccountId

  const parentStableName = account.stableName != null ? PARENT_BY_STABLE_NAME[account.stableName] : undefined
  if (parentStableName == null) return null

  return ledgerAccountStore.all().find(candidate => candidate.stableName === parentStableName)?.accountId ?? null
}

export const groupByParentAccountId = (accounts: readonly SingleChartAccountType[]) => {
  const childrenByParentId = new Map<string | null, SingleChartAccountType[]>()

  accounts.forEach((account) => {
    const parentId = resolveParentAccountId(account)
    childrenByParentId.set(parentId, [...(childrenByParentId.get(parentId) ?? []), account])
  })

  return childrenByParentId
}

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

export const CATEGORIZABLE_ACCOUNT_TYPES = [LedgerAccountType.Expense, LedgerAccountType.Revenue] as const

export const isAccountDeletable = (accountId: string): boolean => {
  const treeIds = collectAccountTreeIds(accountId)
  if (treeIds.size > 1) return false

  return !ledgerEntryStore.all().some(entry =>
    entry.lineItems.some(lineItem => treeIds.has(lineItem.account.accountId)),
  )
}

export const collectAccountTreeIds = (accountId: string): ReadonlySet<string> => {
  const ids = new Set([accountId])

  for (let added = true; added;) {
    added = false
    ledgerAccountStore.all().forEach((account) => {
      const parentId = resolveParentAccountId(account)
      if (parentId != null && ids.has(parentId) && !ids.has(account.accountId)) {
        ids.add(account.accountId)
        added = true
      }
    })
  }

  return ids
}
