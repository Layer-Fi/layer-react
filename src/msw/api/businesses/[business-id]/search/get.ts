import { Schema } from 'effect'

import { type UnifiedSearchResult, UnifiedSearchResultsSchema } from '@schemas/common/unifiedSearch'
import { AskFormSearchEntity } from '@schemas/features/bookkeeping/businessTasks/unifiedAskForm/askFormStep'

import { toSearchId } from '@fixtures/bookkeeping/unifiedAskFormTasks/utils'
import { customerStore } from '@msw/api/businesses/[business-id]/customers/store'
import { listCategorizableLeafAccounts } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import { vendorStore } from '@msw/api/businesses/[business-id]/vendors/store'
import { apiData, readLimit } from '@msw/utils/apiResponse'
import { createListFilter, matchesQuery } from '@msw/utils/createListFilter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeResults = Schema.encodeSync(UnifiedSearchResultsSchema)

const DEFAULT_LIMIT = 20

const toResponse = (results: readonly UnifiedSearchResult[]) => apiData(encodeResults({ results }))

type Contact = { id: string, companyName: string | null, individualName: string | null, email: string | null }

// Company name first, matching the API's search label.
const contactLabel = ({ companyName, individualName }: Contact) => companyName ?? individualName ?? ''

const contactIndex = (entity: AskFormSearchEntity, all: () => readonly Contact[]) =>
  () => all().map(contact => ({ id: toSearchId(entity, contact.id), entity, label: contactLabel(contact), sublabel: contact.email }))

const SEARCH_INDEXES: Record<string, () => readonly UnifiedSearchResult[]> = {
  [AskFormSearchEntity.Category]: () => listCategorizableLeafAccounts().map(({ accountId, name, accountType }) => ({
    id: toSearchId(AskFormSearchEntity.Category, accountId),
    entity: AskFormSearchEntity.Category,
    label: name,
    sublabel: accountType.displayName,
  })),
  [AskFormSearchEntity.Vendor]: contactIndex(AskFormSearchEntity.Vendor, vendorStore.all),
  [AskFormSearchEntity.Customer]: contactIndex(AskFormSearchEntity.Customer, customerStore.all),
}

const filterResults = createListFilter<UnifiedSearchResult>({
  q: matchesQuery(({ label }) => [label]),
})

export const get = createMockEndpoint<readonly UnifiedSearchResult[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/search',
  resolve: ({ override, request }) => {
    if (override) return toResponse(override)

    const index = SEARCH_INDEXES[new URL(request.url).searchParams.get('entity') ?? '']?.() ?? []

    return toResponse(filterResults(index, request).slice(0, readLimit(request, DEFAULT_LIMIT)))
  },
})
