import { Schema } from 'effect'

import {
  type BulkUncategorizeRequest,
  type BulkUncategorizeRequestEncoded,
  BulkUncategorizeRequestSchema,
} from '@schemas/bankTransactions/bulkUncategorize'
import { post } from '@utils/api/authenticatedHttp'
import { useBulkBankTransactionsTriggerSuccess } from '@hooks/api/businesses/[business-id]/bank-transactions/useBulkBankTransactionsTriggerSuccess'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const BULK_UNCATEGORIZE_BANK_TRANSACTIONS_TAG_KEY = '#bulk-uncategorize-bank-transactions'

const bulkUncategorize = post<
  { data: unknown },
  BulkUncategorizeRequestEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/bank-transactions/bulk-uncategorize`)

export const useBulkUncategorize = createMutationHook({
  tags: [BULK_UNCATEGORIZE_BANK_TRANSACTIONS_TAG_KEY],
  request: bulkUncategorize,
  argToBody: (arg: BulkUncategorizeRequest) => Schema.encodeSync(BulkUncategorizeRequestSchema)(arg),
  select: ({ data }) => data,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useBulkBankTransactionsTriggerSuccess,
})
