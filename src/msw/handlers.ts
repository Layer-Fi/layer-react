import { type RequestHandler } from 'msw'

import { get as getAccountingConfiguration } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'
import { get as getCustomAccounts } from '@msw/api/businesses/[business-id]/custom-accounts/get'
import { post as postCustomAccount } from '@msw/api/businesses/[business-id]/custom-accounts/post'
import { get as getCustomers } from '@msw/api/businesses/[business-id]/customers/get'
import { patch as patchCustomer } from '@msw/api/businesses/[business-id]/customers/patch'
import { post as postCustomer } from '@msw/api/businesses/[business-id]/customers/post'
import { get as getBusiness } from '@msw/api/businesses/[business-id]/get'
import { post as postOAuthToken } from '@msw/api/oauth2/token/post'

export const handlers: RequestHandler[] = [
  postOAuthToken.handler,
  getBusiness.handler,
  getAccountingConfiguration.handler,
  getBankAccounts.handler,
  getCustomAccounts.handler,
  postCustomAccount.handler,
  getCustomers.handler,
  postCustomer.handler,
  patchCustomer.handler,
]
