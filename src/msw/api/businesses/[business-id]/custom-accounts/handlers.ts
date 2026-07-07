import { type RequestHandler } from 'msw'

import { get as getCustomAccounts } from '@msw/api/businesses/[business-id]/custom-accounts/get'
import { post as postCustomAccount } from '@msw/api/businesses/[business-id]/custom-accounts/post'

export const customAccountsHandlers: RequestHandler[] = [
  getCustomAccounts.handler,
  postCustomAccount.handler,
]
