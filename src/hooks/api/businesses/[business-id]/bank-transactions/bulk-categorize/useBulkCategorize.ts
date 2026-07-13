import { Schema } from 'effect'

import { CategoryUpdateSchema } from '@schemas/bankTransactions/categoryUpdate'
import { post } from '@utils/api/authenticatedHttp'
import { useBulkBankTransactionsTriggerSuccess } from '@hooks/api/businesses/[business-id]/bank-transactions/useBulkBankTransactionsTriggerSuccess'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const BULK_CATEGORIZE_BANK_TRANSACTIONS_TAG_KEY = '#bulk-categorize-bank-transactions'

export const CategorizeTransactionRequestSchema = Schema.Struct({
  transactionId: Schema.propertySignature(Schema.UUID).pipe(
    Schema.fromKey('transaction_id'),
  ),
  categorization: CategoryUpdateSchema,
})

export const BulkCategorizeRequestSchema = Schema.Struct({
  transactions: Schema.Array(CategorizeTransactionRequestSchema),
})

type BulkCategorizeRequest = typeof BulkCategorizeRequestSchema.Type
type BulkCategorizeRequestEncoded = typeof BulkCategorizeRequestSchema.Encoded

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
