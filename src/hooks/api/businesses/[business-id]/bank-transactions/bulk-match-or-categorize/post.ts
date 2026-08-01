import { Schema } from 'effect'

import {
  type BulkMatchOrCategorizeRequest,
  type BulkMatchOrCategorizeRequestEncoded,
  BulkMatchOrCategorizeRequestSchema,
} from '@schemas/bankTransactions/bulkMatchOrCategorize'
import { post } from '@utils/api/authenticatedHttp'
import { useBulkBankTransactionsTriggerSuccess } from '@api/businesses/[business-id]/bank-transactions/useBankTransactionCacheActions'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const BULK_MATCH_OR_CATEGORIZE_TAG = '#bulk-match-or-categorize'

const _BulkMatchOrCategorizeParamsSchema = Schema.Struct({
  businessId: Schema.String,
})

type BulkMatchOrCategorizeParams = typeof _BulkMatchOrCategorizeParamsSchema.Type

const bulkMatchOrCategorize = post<
  Record<string, unknown>,
  BulkMatchOrCategorizeRequestEncoded,
  BulkMatchOrCategorizeParams
>(
  ({ businessId }) => {
    return `/v1/businesses/${businessId}/bank-transactions/bulk-match-or-categorize`
  },
)

export const useBulkMatchOrCategorizeMutation = createMutationHook({
  tags: [BULK_MATCH_OR_CATEGORIZE_TAG],
  request: bulkMatchOrCategorize,
  argToBody: (arg: BulkMatchOrCategorizeRequest) => Schema.encodeSync(BulkMatchOrCategorizeRequestSchema)(arg),
  select: ({ data }) => data,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useBulkBankTransactionsTriggerSuccess,
})
