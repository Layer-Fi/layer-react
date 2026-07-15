import { Schema } from 'effect'

import { TagBankTransactionsUpdateSchema } from '@schemas/bankTransactions/tagUpdate'
import { type TransactionTag, TransactionTagSchema } from '@schemas/tag'

import { bankTransactionStore, findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { transactionTagFromKeyValue } from '@msw/api/businesses/[business-id]/bank-transactions/transactionTagFromKeyValue'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const decodeTagBody = Schema.decodeUnknownSync(TagBankTransactionsUpdateSchema)
const encodeTransactionTags = Schema.encodeSync(Schema.Array(TransactionTagSchema))

const toResponse = (tags: readonly TransactionTag[]) =>
  apiData({ type: 'Transaction_Tags', tags: encodeTransactionTags(tags) })

const tagKeyValue = (tag: Pick<TransactionTag, 'key' | 'value'>) => JSON.stringify([tag.key, tag.value])

export const post = createMockEndpoint<readonly TransactionTag[], ReturnType<typeof toResponse>>({
  method: 'post',
  path: '*/v1/businesses/:businessId/bank-transactions/tags',
  resolve: async ({ override, request }) => {
    if (override) return toResponse(override)

    const body = decodeTagBody(await readRequestJson(request))
    const tags = body.keyValues.map(transactionTagFromKeyValue)
    const addedKeyValues = new Set(tags.map(tagKeyValue))

    body.transactionIds.forEach((transactionId) => {
      const transaction = findOrSeedBankTransaction(transactionId)
      bankTransactionStore.save({
        ...transaction,
        transactionTags: [
          ...transaction.transactionTags.filter(tag => !addedKeyValues.has(tagKeyValue(tag))),
          ...tags,
        ],
      })
    })

    return toResponse(tags)
  },
})
