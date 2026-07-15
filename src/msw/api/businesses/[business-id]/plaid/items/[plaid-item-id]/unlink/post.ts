import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/plaid/items/:plaidItemId/unlink',
  resolve: ({ params }) => {
    const plaidItemId = String(params.plaidItemId)

    bankAccountStore
      .all()
      .filter(account => account.externalAccounts.some(
        ({ connectionExternalId }) => connectionExternalId === plaidItemId,
      ))
      .forEach((account) => {
        const remaining = account.externalAccounts.filter(
          ({ connectionExternalId }) => connectionExternalId !== plaidItemId,
        )

        bankAccountStore.save({
          ...account,
          externalAccounts: remaining,
          isDisconnected: remaining.length === 0 || account.isDisconnected,
        })
      })

    return apiData({})
  },
})
