import { Schema } from 'effect'

import { type CustomAccount, CustomAccountSchema } from '@schemas/customAccounts'

import { customAccountStore } from '@msw/api/businesses/[business-id]/custom-accounts/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeCustomAccount = Schema.encodeSync(CustomAccountSchema)

const toResponse = (customAccounts: readonly CustomAccount[]) =>
  apiData({ custom_accounts: customAccounts.map(account => encodeCustomAccount(account)) })

export const get = createMockEndpoint<readonly CustomAccount[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/custom-accounts',
  resolve: ({ override: customAccounts = customAccountStore.all(), request }) => {
    // Mirror the real endpoint: `?user_created=` filters the result set.
    const userCreated = new URL(request.url).searchParams.get('user_created')
    const filtered = userCreated === null
      ? customAccounts
      : customAccounts.filter(account => account.userCreated === (userCreated === 'true'))

    return toResponse(filtered)
  },
})
