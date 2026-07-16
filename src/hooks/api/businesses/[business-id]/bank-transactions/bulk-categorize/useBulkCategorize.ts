import { Schema } from 'effect'

import {
  type BulkCategorizeRequest,
  type BulkCategorizeRequestEncoded,
  BulkCategorizeRequestSchema,
} from '@schemas/bankTransactions/bulkCategorize'
import { post } from '@utils/api/authenticatedHttp'
import { useBulkBankTransactionsTriggerSuccess } from '@hooks/api/businesses/[business-id]/bank-transactions/useBulkBankTransactionsTriggerSuccess'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const BULK_CATEGORIZE_BANK_TRANSACTIONS_TAG_KEY = '#bulk-categorize-bank-transactions'

const bulkCategorize = post<
  Record<string, unknown>,
  BulkCategorizeRequestEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/bank-transactions/bulk-categorize`)

export const useBulkCategorize = createMutationHook({
  tags: [BULK_CATEGORIZE_BANK_TRANSACTIONS_TAG_KEY],
  request: bulkCategorize,
  argToBody: (arg: BulkCategorizeRequest) => Schema.encodeSync(BulkCategorizeRequestSchema)(arg),
  select: ({ data }) => data,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useBulkBankTransactionsTriggerSuccess,
})
