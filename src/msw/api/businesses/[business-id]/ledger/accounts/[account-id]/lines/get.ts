import { Schema } from 'effect'

import { type LedgerAccountLineItem, LedgerAccountLineItemSchema, type LedgerEntry } from '@schemas/generalLedger/ledgerEntry'

import { collectAccountTreeIds, ledgerAccountStore } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import { ledgerEntryStore } from '@msw/api/businesses/[business-id]/ledger/entries/store'
import { paginatedApiData } from '@msw/utils/apiResponse'
import { createListSorter } from '@msw/utils/createListSorter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeLineItem = Schema.encodeSync(LedgerAccountLineItemSchema)

const byPostingOrder = (
  a: { entry: LedgerEntry },
  b: { entry: LedgerEntry },
) => a.entry.entryAt.getTime() - b.entry.entryAt.getTime() || (a.entry.entryNumber ?? 0) - (b.entry.entryNumber ?? 0)

const linesForAccount = (accountId: string, includeChildren: boolean) => {
  const includedIds = includeChildren ? collectAccountTreeIds(accountId) : new Set([accountId])
  const normality = ledgerAccountStore.findById(accountId)?.normality

  const posted = ledgerEntryStore.all()
    .flatMap(entry => entry.lineItems
      .filter(line => includedIds.has(line.account.accountId))
      .map(line => ({ entry, line })))
    .sort(byPostingOrder)

  let runningBalance = 0

  return posted.map(({ entry, line }): LedgerAccountLineItem => {
    const { id, account, amount, direction, entryReversalOf, entryReversedBy } = line
    runningBalance += direction === (normality ?? account.normality) ? amount : -amount

    return {
      id,
      entryId: entry.id,
      entryNumber: entry.entryNumber,
      account,
      amount,
      direction,
      date: entry.entryAt,
      source: entry.source,
      entryReversalOf,
      entryReversedBy,
      isReversed: entryReversedBy != null,
      runningBalance,
      tags: [],
    }
  })
}

const sortAccountLines = createListSorter<LedgerAccountLineItem>({
  entry_at: line => line.date.getTime(),
  created_at: line => line.date.getTime(),
  entry_number: line => line.entryNumber ?? 0,
}, 'entry_at')

export const get = createMockEndpoint<readonly LedgerAccountLineItem[], ReturnType<typeof paginatedApiData>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/ledger/accounts/:accountId/lines',
  resolve: ({ override, request, params }) => {
    const accountId = params.accountId as string
    const includeChildren = new URL(request.url).searchParams.get('include_child_account_lines') === 'true'

    const lines = override ?? linesForAccount(accountId, includeChildren)

    return paginatedApiData(sortAccountLines(lines, request).map(line => encodeLineItem(line)), request)
  },
})
