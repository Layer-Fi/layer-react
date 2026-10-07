import { Schema } from 'effect'

import { type UnifiedSearchResult, UnifiedSearchResultsSchema } from '@schemas/common/unifiedSearch'
import { AskFormSearchEntity } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'
import { LedgerAccountType } from '@schemas/features/generalLedger/ledgerAccountType'

import { customerStore } from '@msw/api/businesses/[business-id]/customers/store'
import { groupByParentAccountId, ledgerAccountStore } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import { vendorStore } from '@msw/api/businesses/[business-id]/vendors/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeResults = Schema.encodeSync(UnifiedSearchResultsSchema)

const DEFAULT_LIMIT = 20

const toResponse = (results: readonly UnifiedSearchResult[]) => apiData(encodeResults({ results }))

const contactLabel = ({ companyName, individualName }: { companyName: string | null, individualName: string | null }) =>
  companyName ?? individualName ?? ''

const categoryResults = (): readonly UnifiedSearchResult[] => {
  const parentIds = new Set(groupByParentAccountId(ledgerAccountStore.all()).keys())

  return ledgerAccountStore.all()
    .filter(({ accountId, accountType }) =>
      !parentIds.has(accountId)
      && (accountType.value === LedgerAccountType.Expense || accountType.value === LedgerAccountType.Revenue))
    .map(({ accountId, name, accountType }) => ({
      id: `acct_${accountId}`,
      entity: AskFormSearchEntity.Category,
      label: name,
      sublabel: accountType.displayName,
    }))
}

const SEARCH_INDEXES: Record<string, () => readonly UnifiedSearchResult[]> = {
  [AskFormSearchEntity.Category]: categoryResults,
  [AskFormSearchEntity.Vendor]: () => vendorStore.all().map(vendor => ({
    id: `vend_${vendor.id}`,
    entity: AskFormSearchEntity.Vendor,
    label: contactLabel(vendor),
    sublabel: vendor.email,
  })),
  [AskFormSearchEntity.Customer]: () => customerStore.all().map(customer => ({
    id: `cust_${customer.id}`,
    entity: AskFormSearchEntity.Customer,
    label: contactLabel(customer),
    sublabel: customer.email,
  })),
}

export const get = createMockEndpoint<readonly UnifiedSearchResult[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/search',
  resolve: ({ override, request }) => {
    if (override) return toResponse(override)

    const { searchParams } = new URL(request.url)
    const needle = (searchParams.get('q') ?? '').trim().toLowerCase()
    const limit = Number(searchParams.get('limit') ?? DEFAULT_LIMIT)

    return toResponse(
      (SEARCH_INDEXES[searchParams.get('entity') ?? '']?.() ?? [])
        .filter(({ label }) => label.toLowerCase().includes(needle))
        .slice(0, limit),
    )
  },
})
