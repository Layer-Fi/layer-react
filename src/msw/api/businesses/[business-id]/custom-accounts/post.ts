import { Schema } from 'effect'

import { type CustomAccount, CustomAccountSchema } from '@schemas/customAccounts'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeCustomAccount } from '@fixtures/customAccounts/mocks'

const encodeCustomAccount = Schema.encodeSync(CustomAccountSchema)

export const toCreateCustomAccountResponse = (customAccount: CustomAccount) =>
  apiData(encodeCustomAccount(customAccount))

export const post = createMockEndpoint<CustomAccount, ReturnType<typeof toCreateCustomAccountResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/custom-accounts',
  resolve: ({ override: customAccount = makeCustomAccount() }) => toCreateCustomAccountResponse(customAccount),
})
