import { type OAuthResponse } from '@internal-types/authentication'

import { createFixtureFactory } from '@fixtures/utils/createFixtureFactory'

const baseOAuthResponse: OAuthResponse = {
  access_token: 'test-access-token',
  token_type: 'Bearer',
  expires_in: 3600,
}

export const { make: makeOAuthResponse, makeMany: makeOAuthResponses } =
  createFixtureFactory(baseOAuthResponse)
