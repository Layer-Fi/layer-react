import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { MatchSchema } from '@schemas/features/bankTransactions/match'
import { type ConfirmMatchUpdateEncoded } from '@schemas/features/bankTransactions/matchUpdate'
import { put } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

export type MatchBankTransactionBody = ConfirmMatchUpdateEncoded

const MatchBankTransactionResponseSchema = UnwrappedDataResponseSchema(MatchSchema)

const matchBankTransaction = put<
  typeof MatchBankTransactionResponseSchema.Encoded,
  MatchBankTransactionBody,
  {
    businessId: string
    bankTransactionId: string
  }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/match`,
)

const MATCH_BANK_TRANSACTION_TAG = '#match-bank-transaction'

type MatchBankTransactionArgs = MatchBankTransactionBody & {
  bankTransactionId: string
}

export const usePutMatchBankTransaction = createMutationHook({
  tags: [MATCH_BANK_TRANSACTION_TAG],
  request: matchBankTransaction,
  argToParams: ({ bankTransactionId }: MatchBankTransactionArgs) => ({ bankTransactionId }),
  argToBody: ({ bankTransactionId: _bankTransactionId, ...body }: MatchBankTransactionArgs) => body,
  schema: MatchBankTransactionResponseSchema,
  swrOptions: { throwOnError: true },
})
