import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/external-accounts/:accountId/exclude',
  resolve: ({ params }) => {
    const accountId = String(params.accountId)

    const owner = bankAccountStore
      .all()
      .find(account => account.externalAccounts.some(({ id }) => id === accountId))

    if (owner) bankAccountStore.deleteById(owner.id)

    return apiData({})
  },
})
