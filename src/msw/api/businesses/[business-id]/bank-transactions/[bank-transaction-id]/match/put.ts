import { pipe, Schema } from 'effect'

import { type Match, MatchSchema } from '@schemas/bankTransactions/match'

import { applyConfirmedMatch } from '@msw/api/businesses/[business-id]/bank-transactions/applyCategoryUpdate'
import { bankTransactionStore, findOrSeedBankTransaction } from '@msw/api/businesses/[business-id]/bank-transactions/store'
import { apiData } from '@msw/utils/apiResponse'
import { createMockEndpoint } from '@msw/utils/createMockEndpoint'
import { readRequestJson } from '@msw/utils/request'

const encodeMatch = Schema.encodeSync(MatchSchema)

const MatchBankTransactionBodySchema = Schema.Struct({
  matchId: pipe(
    Schema.propertySignature(Schema.String),
    Schema.fromKey('match_id'),
  ),
})

const decodeMatchBody = Schema.decodeUnknownSync(MatchBankTransactionBodySchema)

const toResponse = (match: Match) => apiData(encodeMatch(match))

export const put = createMockEndpoint<Match, ReturnType<typeof toResponse>>({
  method: 'put',
  path: '*/v1/businesses/:businessId/bank-transactions/:bankTransactionId/match',
  resolve: async ({ override, request, params }) => {
    if (override) return toResponse(override)

    const { matchId } = decodeMatchBody(await readRequestJson(request))
    const { transaction, match } = applyConfirmedMatch(
      findOrSeedBankTransaction(params.bankTransactionId as string),
      matchId,
    )
    bankTransactionStore.save(transaction)

    return toResponse(match)
  },
})
