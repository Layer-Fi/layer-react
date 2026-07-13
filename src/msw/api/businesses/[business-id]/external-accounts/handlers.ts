import { type RequestHandler } from 'msw'

import { post as confirmExternalAccount } from '@msw/api/businesses/[business-id]/external-accounts/[external-account-id]/confirm/post'
import { post as excludeExternalAccount } from '@msw/api/businesses/[business-id]/external-accounts/[external-account-id]/exclude/post'

export const externalAccountsHandlers: RequestHandler[] = [
  confirmExternalAccount.handler,
  excludeExternalAccount.handler,
]
