import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const post = createMockEndpoint({
  method: 'post',
  path: '*/v1/businesses/:businessId/external-accounts/:accountId/confirm',
  resolve: ({ params }) => {
    const accountId = String(params.accountId)

    const owner = bankAccountStore
      .all()
      .find(account => account.externalAccounts.some(({ id }) => id === accountId))

    if (owner) {
      bankAccountStore.save({
        ...owner,
        externalAccounts: owner.externalAccounts.map(externalAccount =>
          externalAccount.id === accountId
            ? {
              ...externalAccount,
              notifications: externalAccount.notifications.filter(
                ({ type }) => type !== 'CONFIRM_RELEVANT',
              ),
            }
            : externalAccount,
        ),
      })
    }

    return apiData({})
  },
})
