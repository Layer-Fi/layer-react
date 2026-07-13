import { type RequestHandler } from 'msw'

import { post as postStripeConnectAccountLink } from '@msw/api/businesses/[business-id]/stripe/connect-account-link/post'
import { get as getStripeAccountStatus } from '@msw/api/businesses/[business-id]/stripe/status/get'

export const stripeHandlers: RequestHandler[] = [
  getStripeAccountStatus.handler,
  postStripeConnectAccountLink.handler,
]
