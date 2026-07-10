import { type SingleChartAccountType } from '@schemas/generalLedger/ledgerAccount'

import { ledgerEntryStore } from '@msw/api/businesses/[business-id]/ledger/entries/store'
import { createMockStore } from '@msw/utils/createMockStore'
import { PARENT_BY_STABLE_NAME } from '@fixtures/chartOfAccounts/constants'
import { chartOfAccounts } from '@fixtures/generated/chartOfAccounts.gen'

export const ledgerAccountStore = createMockStore(
  () => chartOfAccounts,
  { getId: account => account.accountId },
)

export const accountParentStore = createMockStore<{ id: string, parentAccountId: string }>(() => [])

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
