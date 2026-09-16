import { ledgerAccountStore } from '@msw/api/businesses/[business-id]/ledger/accounts/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreDeleteResolver } from '@msw/utils/createStoreResolvers'

export const del = createMockEndpoint<undefined, Record<string, never>>({
  method: 'delete',
  path: '*/v1/businesses/:businessId/ledger/accounts/:accountId',
  resolve: createStoreDeleteResolver({
    idParam: 'accountId',
    store: ledgerAccountStore,
  }),
})
