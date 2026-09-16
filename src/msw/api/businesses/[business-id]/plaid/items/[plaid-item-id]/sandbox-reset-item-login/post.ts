import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/plaid/items/:plaidItemId/sandbox-reset-item-login',
  resolve: ({ params }) => {
    const plaidItemId = String(params.plaidItemId)

    bankAccountStore.all().forEach((account) => {
      if (!account.externalAccounts.some(({ connectionExternalId }) => connectionExternalId === plaidItemId)) return

      bankAccountStore.save({
        ...account,
        externalAccounts: account.externalAccounts.map(externalAccount =>
          externalAccount.connectionExternalId === plaidItemId
            ? {
              ...externalAccount,
              connectionNeedsRepairAsOf: new Date(),
              reconnectWithNewCredentials: true,
            }
            : externalAccount,
        ),
      })
    })

    return apiData({})
  },
})
