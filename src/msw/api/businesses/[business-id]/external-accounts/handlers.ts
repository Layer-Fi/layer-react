import { type RequestHandler } from 'msw'

import { post as confirmExternalAccount } from '@msw/api/businesses/[business-id]/external-accounts/[external-account-id]/confirm/post'
import { post as excludeExternalAccount } from '@msw/api/businesses/[business-id]/external-accounts/[external-account-id]/exclude/post'
import { post as updateConnectionStatus } from '@msw/api/businesses/[business-id]/external-accounts/update-connection-status/post'

export const externalAccountsHandlers: RequestHandler[] = [
  confirmExternalAccount.handler,
  excludeExternalAccount.handler,
  updateConnectionStatus.handler,
]
