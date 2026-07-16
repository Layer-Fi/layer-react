import { type RequestHandler } from 'msw'

import { post as parseCustomAccountCsv } from '@msw/api/businesses/[business-id]/custom-accounts/[custom-account-id]/parse-csv/post'
import { patch as patchCustomAccountTransaction } from '@msw/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/[transaction-id]/patch'
import { post as createCustomAccountTransactions } from '@msw/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/post'
import { post as postRecordCustomAccountTransaction } from '@msw/api/businesses/[business-id]/custom-accounts/[custom-account-id]/transactions/record/post'
import { get as getCustomAccounts } from '@msw/api/businesses/[business-id]/custom-accounts/get'
import { post as postCustomAccount } from '@msw/api/businesses/[business-id]/custom-accounts/post'

export const customAccountsHandlers: RequestHandler[] = [
  getCustomAccounts.handler,
  postCustomAccount.handler,
  postRecordCustomAccountTransaction.handler,
  patchCustomAccountTransaction.handler,
  parseCustomAccountCsv.handler,
  createCustomAccountTransactions.handler,
]
