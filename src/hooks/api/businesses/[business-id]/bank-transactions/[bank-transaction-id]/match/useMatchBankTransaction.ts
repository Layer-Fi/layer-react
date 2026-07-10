import { MatchSchema } from '@schemas/bankTransactions/match'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { put } from '@utils/api/authenticatedHttp'
import { useBankTransactionTriggerSuccess } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/useBankTransactionTriggerSuccess'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

export type MatchBankTransactionBody = {
  match_id: string
  type: 'Confirm_Match'
}

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

export const useMatchBankTransaction = createMutationHook({
  tags: [MATCH_BANK_TRANSACTION_TAG],
  request: matchBankTransaction,
  argToParams: ({ bankTransactionId }: MatchBankTransactionArgs) => ({ bankTransactionId }),
  argToBody: ({ bankTransactionId: _bankTransactionId, ...body }: MatchBankTransactionArgs) => body,
  schema: MatchBankTransactionResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useBankTransactionTriggerSuccess,
})
