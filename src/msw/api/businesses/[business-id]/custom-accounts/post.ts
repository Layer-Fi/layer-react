import { Schema } from 'effect'

import { type CustomAccount, CustomAccountSchema } from '@schemas/customAccounts'

import { customAccountFromCreateRequest } from '@msw/api/businesses/[business-id]/custom-accounts/customAccountFromCreateRequest'
import { customAccountStore } from '@msw/api/businesses/[business-id]/custom-accounts/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { createStoreCreateResolver } from '@msw/utils/createStoreResolvers'
import { makeCustomAccount } from '@fixtures/customAccounts/mocks'

const encodeCustomAccount = Schema.encodeSync(CustomAccountSchema)

export const toCreateCustomAccountResponse = (customAccount: CustomAccount) =>
  apiData(encodeCustomAccount(customAccount))

export const post = createMockEndpoint<CustomAccount, ReturnType<typeof toCreateCustomAccountResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/custom-accounts',
  resolve: createStoreCreateResolver({
    store: customAccountStore,
    makeBase: id => makeCustomAccount({ id }),
    fromRequest: customAccountFromCreateRequest,
    toResponse: toCreateCustomAccountResponse,
  }),
})
