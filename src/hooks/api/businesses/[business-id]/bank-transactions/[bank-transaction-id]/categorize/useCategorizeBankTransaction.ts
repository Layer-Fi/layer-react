import type { SWRInfiniteKeyedMutator } from 'swr/infinite'

import { BankTransactionSchema } from '@schemas/bankTransactions/bankTransaction'
import { type CategoryUpdate, type CategoryUpdateEncoded, encodeCategoryUpdate } from '@schemas/bankTransactions/categoryUpdate'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { put } from '@utils/api/authenticatedHttp'
import { useBankTransactionTriggerSuccess } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/useBankTransactionTriggerSuccess'
import { type GetBankTransactionsReturn } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const CATEGORIZE_BANK_TRANSACTION_TAG = '#categorize-bank-transaction'

const CategorizeBankTransactionResponseSchema = UnwrappedDataResponseSchema(BankTransactionSchema)

const categorizeBankTransaction = put<
  typeof CategorizeBankTransactionResponseSchema.Encoded,
  CategoryUpdateEncoded,
  {
    businessId: string
    bankTransactionId: string
  }
>(
  ({ businessId, bankTransactionId }) =>
    `/v1/businesses/${businessId}/bank-transactions/${bankTransactionId}/categorize`,
)

type CategorizeBankTransactionArgs = CategoryUpdate & {
  bankTransactionId: string
}

export type UseCategorizeBankTransactionOptions = {
  mutateBankTransactions: SWRInfiniteKeyedMutator<
    Array<GetBankTransactionsReturn>
  >
}

export const useCategorizeBankTransaction = createMutationHook({
  tags: [CATEGORIZE_BANK_TRANSACTION_TAG],
  request: categorizeBankTransaction,
  argToParams: ({ bankTransactionId }: CategorizeBankTransactionArgs) => ({ bankTransactionId }),
  argToBody: ({ bankTransactionId: _bankTransactionId, ...rest }: CategorizeBankTransactionArgs) =>
    encodeCategoryUpdate(rest),
  schema: CategorizeBankTransactionResponseSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useBankTransactionTriggerSuccess,
})
