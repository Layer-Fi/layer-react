import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreDeleteResolver } from '@msw/utils/createStoreResolvers'

export const del = createMockEndpoint<undefined, Record<string, never>>({
  method: 'delete',
  path: '*/v1/businesses/:businessId/bank-accounts/:bankAccountId',
  resolve: createStoreDeleteResolver({
    idParam: 'bankAccountId',
    store: bankAccountStore,
  }),
})
