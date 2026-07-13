import { Schema } from 'effect'

import { post } from '@utils/api/authenticatedHttp'
import { useBulkBankTransactionsTriggerSuccess } from '@hooks/api/businesses/[business-id]/bank-transactions/useBulkBankTransactionsTriggerSuccess'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const BULK_UNCATEGORIZE_BANK_TRANSACTIONS_TAG_KEY = '#bulk-uncategorize-bank-transactions'

export const BulkUncategorizeRequestSchema = Schema.Struct({
  transactionIds: Schema.propertySignature(Schema.Array(Schema.UUID)).pipe(
    Schema.fromKey('transaction_ids'),
  ),
})

type BulkUncategorizeRequest = typeof BulkUncategorizeRequestSchema.Type
type BulkUncategorizeRequestEncoded = typeof BulkUncategorizeRequestSchema.Encoded

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
