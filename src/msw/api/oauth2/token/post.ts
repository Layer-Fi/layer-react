import { type OAuthResponse } from '@internal-types/shared/authentication'

import { makeOAuthResponse } from '@fixtures/auth/mocks'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'

export const post = createMockEndpoint<OAuthResponse, OAuthResponse>({
  method: 'post',
  path: '*/oauth2/token',
  resolve: ({ override: oauthResponse = makeOAuthResponse() }) => oauthResponse,
})
