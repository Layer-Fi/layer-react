import { Schema } from 'effect'

import { type CustomAccount, CustomAccountSchema } from '@schemas/customAccounts'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { customAccounts as defaultCustomAccounts } from '@fixtures/generated/customAccounts.gen'

const encodeCustomAccount = Schema.encodeSync(CustomAccountSchema)

const toResponse = (customAccounts: readonly CustomAccount[]) =>
  apiData({
    type: 'Custom_Accounts' as const,
    custom_accounts: customAccounts.map(account => encodeCustomAccount(account)),
  })

export const get = createMockEndpoint({
  method: 'get',
  path: '*/v1/businesses/:businessId/custom-accounts',
  resolve: (customAccounts: readonly CustomAccount[] = defaultCustomAccounts) =>
    toResponse(customAccounts),
})
