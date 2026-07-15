import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/external-accounts/update-connection-status',
  resolve: () => {
    bankAccountStore.all().forEach((account) => {
      bankAccountStore.save({
        ...account,
        externalAccounts: account.externalAccounts.map(externalAccount => ({
          ...externalAccount,
          connectionNeedsRepairAsOf: null,
          reconnectWithNewCredentials: false,
        })),
      })
    })

    return apiData({})
  },
})
