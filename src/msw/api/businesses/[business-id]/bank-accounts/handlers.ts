import { type RequestHandler } from 'msw'

import { del as deleteBankAccount } from '@msw/api/businesses/[business-id]/bank-accounts/[bank-account-id]/delete'
import { post as setOpeningBalance } from '@msw/api/businesses/[business-id]/bank-accounts/[bank-account-id]/opening-balance/post'
import { get as getBankAccounts } from '@msw/api/businesses/[business-id]/bank-accounts/get'

export const bankAccountsHandlers: RequestHandler[] = [
  getBankAccounts.handler,
  deleteBankAccount.handler,
  setOpeningBalance.handler,
]
