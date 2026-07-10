import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

/**
 * Confirming an external account clears its `CONFIRM_RELEVANT` notification on
 * the owning bank account, so the next bank-accounts fetch no longer reports it
 * as needing confirmation.
 */
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
