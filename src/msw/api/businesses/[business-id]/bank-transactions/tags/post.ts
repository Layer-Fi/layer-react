import { Schema } from 'effect'

import { type TransactionTag, TransactionTagSchema } from '@schemas/tag'

import { bankTransactionStore, findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const TagBankTransactionsBodySchema = Schema.Struct({
  key_values: Schema.Array(Schema.Struct({
    key: Schema.String,
    dimension_display_name: Schema.optional(Schema.NullOr(Schema.String)),
    value: Schema.String,
    value_display_name: Schema.optional(Schema.NullOr(Schema.String)),
  })),
  transaction_ids: Schema.Array(Schema.String),
})

const decodeTagBody = Schema.decodeUnknownSync(TagBankTransactionsBodySchema)
const encodeTransactionTags = Schema.encodeSync(Schema.Array(TransactionTagSchema))

const toResponse = (tags: readonly TransactionTag[]) =>
  apiData({ type: 'Transaction_Tags', tags: encodeTransactionTags(tags) })

export const post = createMockEndpoint<readonly TransactionTag[], ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/bank-transactions/tags',
  resolve: async ({ override, request }) => {
    if (override) return toResponse(override)

    const body = decodeTagBody(await readRequestJson(request))
    const now = new Date()

    const tags = body.key_values.map((keyValue): TransactionTag => ({
      id: crypto.randomUUID(),
      key: keyValue.key,
      value: keyValue.value,
      dimensionDisplayName: keyValue.dimension_display_name ?? null,
      valueDisplayName: keyValue.value_display_name ?? null,
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
      deletedAt: null,
    }))

    body.transaction_ids.forEach((transactionId) => {
      const transaction = findOrSeedBankTransaction(transactionId)
      bankTransactionStore.save({
        ...transaction,
        transactionTags: [...transaction.transactionTags, ...tags],
      })
    })

    return toResponse(tags)
  },
})
