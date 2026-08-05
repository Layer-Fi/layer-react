import { Schema } from 'effect'

import {
  type BulkCategorizeRequest,
  type BulkCategorizeRequestEncoded,
  BulkCategorizeRequestSchema,
} from '@schemas/features/bankTransactions/bulkCategorize'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { useBankTransactionTriggerSuccess } from '@api/businesses/[business-id]/bank-transactions/triggerSuccess'

const BULK_CATEGORIZE_BANK_TRANSACTIONS_TAG_KEY = '#bulk-categorize-bank-transactions'

const bulkCategorize = post<
  Record<string, unknown>,
  BulkCategorizeRequestEncoded,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/bank-transactions/bulk-categorize`)

export const usePostBulkCategorize = createMutationHook({
  tags: [BULK_CATEGORIZE_BANK_TRANSACTIONS_TAG_KEY],
  request: bulkCategorize,
  argToBody: (arg: BulkCategorizeRequest) => Schema.encodeSync(BulkCategorizeRequestSchema)(arg),
  select: ({ data }) => data,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useBankTransactionTriggerSuccess,
})
