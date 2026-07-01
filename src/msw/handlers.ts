import { type RequestHandler } from 'msw'

import { get as getAccountingConfiguration } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { get as getBankTransactions } from '@msw/api/businesses/[business-id]/bank-transactions/get'
import { get as getCustomAccounts } from '@msw/api/businesses/[business-id]/custom-accounts/get'
import { post as postCustomAccount } from '@msw/api/businesses/[business-id]/custom-accounts/post'
import { get as getBusiness } from '@msw/api/businesses/[business-id]/get'
import { post as postOAuthToken } from '@msw/api/oauth2/token/post'

export const handlers: RequestHandler[] = [
  postOAuthToken.handler,
  getBusiness.handler,
  getAccountingConfiguration.handler,
  getBankTransactions.handler,
  getCustomAccounts.handler,
  postCustomAccount.handler,
]
