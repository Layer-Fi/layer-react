import { type OAuthResponse } from '@internal-types/authentication'

import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { makeOAuthResponse } from '@fixtures/auth/mocks'

export const post = createMockEndpoint<OAuthResponse, OAuthResponse>({
  method: 'post',
  path: '*/oauth2/token',
  resolve: ({ override: oauthResponse = makeOAuthResponse() }) => oauthResponse,
})
