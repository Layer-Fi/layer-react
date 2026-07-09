import { Schema } from 'effect'

import {
  LedgerBalancesSchema,
  type NestedLedgerAccountType,
  type SingleChartAccountType,
} from '@schemas/generalLedger/ledgerAccount'

import { groupByParentAccountId, isAccountDeletable, ledgerAccountStore } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import { ledgerEntryStore } from '@msw/api/businesses/[business-id]/ledger/entries/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeBalances = Schema.encodeSync(LedgerBalancesSchema)

const postedBalanceByAccountId = () => {
  const balances = new Map<string, number>()
  const accountsById = new Map(ledgerAccountStore.all().map(account => [account.accountId, account]))

  ledgerEntryStore.all().forEach((entry) => {
    entry.lineItems.forEach((lineItem) => {
      const accountId = lineItem.account.accountId
      const normality = accountsById.get(accountId)?.normality ?? lineItem.account.normality
      const sign = lineItem.direction === normality ? 1 : -1
      balances.set(accountId, (balances.get(accountId) ?? 0) + sign * lineItem.amount)
    })
  })

  return balances
}

export const toBalancesResponse = (accounts: readonly SingleChartAccountType[]) => {
  const childrenByParentId = groupByParentAccountId(accounts)
  const postedBalances = postedBalanceByAccountId()

  const toNode = (account: SingleChartAccountType): NestedLedgerAccountType => {
    const subAccounts = (childrenByParentId.get(account.accountId) ?? []).map(toNode)

    return {
      ...account,
      balance: subAccounts.reduce((sum, child) => sum + child.balance, postedBalances.get(account.accountId) ?? 0),
      isDeletable: isAccountDeletable(account.accountId),
      subAccounts,
    }
  }

  return apiData(encodeBalances({ accounts: (childrenByParentId.get(null) ?? []).map(toNode) }))
}

export const get = createMockEndpoint<readonly SingleChartAccountType[], ReturnType<typeof toBalancesResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/ledger/balances',
  resolve: ({ override: accounts = ledgerAccountStore.all() }) => toBalancesResponse(accounts),
})
