import { Schema } from 'effect'

import { RemoveBankTransactionTagsUpdateSchema } from '@schemas/bankTransactions/tagUpdate'

import { bankTransactionStore } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const decodeRemoveTagsBody = Schema.decodeUnknownSync(RemoveBankTransactionTagsUpdateSchema)

export const del = createMockEndpoint<Record<string, never>, Record<string, never>>({
  method: 'delete',
  path: '*/v1/businesses/:businessId/bank-transactions/tags',
  resolve: async ({ override, request }) => {
    if (override) return override

    const { tagIds } = decodeRemoveTagsBody(await readRequestJson(request))

    bankTransactionStore.all().forEach((transaction) => {
      if (!transaction.transactionTags.some(tag => tagIds.includes(tag.id))) return

      bankTransactionStore.save({
        ...transaction,
        transactionTags: transaction.transactionTags.filter(tag => !tagIds.includes(tag.id)),
      })
    })

    return {}
  },
})
