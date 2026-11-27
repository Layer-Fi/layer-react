import { Schema } from 'effect'

import { PcMsoOwnerSchema } from '@schemas/features/bankAccounts/bankAccount'

import { bankAccountStore } from '@msw/api/businesses/[business-id]/bank-accounts/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const put = createMockEndpoint({
  method: 'put',
  path: '*/v1/businesses/:businessId/bank-accounts/:bankAccountId/pc-mso-owner',
  resolve: async ({ request, params }) => {
    const { owner } = Schema.decodeUnknownSync(Schema.Struct({ owner: PcMsoOwnerSchema }))(await request.json())
    const account = bankAccountStore.findById(String(params.bankAccountId))
    if (account) {
      bankAccountStore.save({
        ...account,
        pcMsoOwner: owner,
        notifications: account.notifications.filter(({ type }) => type !== 'PC_MSO_OWNER_MISSING'),
      })
    }
    return apiData({})
  },
})
