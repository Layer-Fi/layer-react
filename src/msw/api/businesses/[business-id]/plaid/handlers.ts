import { type RequestHandler } from 'msw'

import { get as getPlaidHostedLinkStatus } from '@msw/api/businesses/[business-id]/plaid/hosted-link/get'
import { post as breakPlaidItemConnection } from '@msw/api/businesses/[business-id]/plaid/items/[plaid-item-id]/sandbox-reset-item-login/post'
import { post as unlinkPlaidItem } from '@msw/api/businesses/[business-id]/plaid/items/[plaid-item-id]/unlink/post'
import { post as exchangePlaidPublicToken } from '@msw/api/businesses/[business-id]/plaid/link/exchange/post'
import { post as createPlaidLink } from '@msw/api/businesses/[business-id]/plaid/link/post'
import { post as createPlaidUpdateModeLink } from '@msw/api/businesses/[business-id]/plaid/update-mode-link/post'

export const plaidHandlers: RequestHandler[] = [
  createPlaidLink.handler,
  exchangePlaidPublicToken.handler,
  getPlaidHostedLinkStatus.handler,
  createPlaidUpdateModeLink.handler,
  unlinkPlaidItem.handler,
  breakPlaidItemConnection.handler,
]
