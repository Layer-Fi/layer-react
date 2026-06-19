import { Schema } from 'effect'

import { type CustomAccount, CustomAccountSchema } from '@schemas/customAccounts'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { customAccounts as defaultCustomAccounts } from '@fixtures/generated/customAccounts.gen'

const encodeCustomAccount = Schema.encodeSync(CustomAccountSchema)

const toResponse = (customAccounts: readonly CustomAccount[]) =>
  apiData({ custom_accounts: customAccounts.map(account => encodeCustomAccount(account)) })

export const get = createMockEndpoint<readonly CustomAccount[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/custom-accounts',
  resolve: ({ override: customAccounts = defaultCustomAccounts, request }) => {
    // Mirror the real endpoint: `?user_created=` filters the result set.
    const userCreated = new URL(request.url).searchParams.get('user_created')
    const filtered = userCreated === null
      ? customAccounts
      : customAccounts.filter(account => account.userCreated === (userCreated === 'true'))

    return toResponse(filtered)
  },
})
