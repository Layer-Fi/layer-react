import { Schema } from 'effect'

import { type CustomAccount, CustomAccountSchema } from '@schemas/customAccounts'

import { customAccountStore } from '@msw/api/businesses/[business-id]/custom-accounts/store'
import { apiData } from '@msw/utils/apiResponse'
import { createListFilter, matchesBoolean } from '@msw/utils/createListFilter'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeCustomAccount = Schema.encodeSync(CustomAccountSchema)

const toResponse = (customAccounts: readonly CustomAccount[]) =>
  apiData({ custom_accounts: customAccounts.map(account => encodeCustomAccount(account)) })

const filterCustomAccounts = createListFilter<CustomAccount>({
  user_created: matchesBoolean(account => account.userCreated),
})

export const get = createMockEndpoint<readonly CustomAccount[], ReturnType<typeof toResponse>>({
  method: 'get',
  path: '*/v1/businesses/:businessId/custom-accounts',
  resolve: ({ override: customAccounts = customAccountStore.all(), request }) =>
    toResponse(filterCustomAccounts(customAccounts, request)),
})
