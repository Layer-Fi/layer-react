import { Schema } from 'effect'

import { type ApiPlaidHostedLinkStatus, ApiPlaidHostedLinkStatusSchema, PlaidHostedLinkState } from '@schemas/linkedAccounts/plaid'

import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

const encodeStatus = Schema.encodeSync(ApiPlaidHostedLinkStatusSchema)

export const get = createMockEndpoint({
  method: 'get',
  path: '*/v1/businesses/:businessId/plaid/hosted-link',
  resolve: ({ override }: { override?: ApiPlaidHostedLinkStatus }) =>
    apiData(encodeStatus(override ?? { state: PlaidHostedLinkState.NOT_STARTED })),
})
