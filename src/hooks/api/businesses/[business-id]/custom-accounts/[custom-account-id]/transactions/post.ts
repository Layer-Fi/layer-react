import { Schema } from 'effect'

import { UnwrappedDataResponseSchema } from '@schemas/common/utils'
import { BankTransactionDataOnlySchema } from '@schemas/features/bankTransactions/bankTransactionDataOnly'
import type { RawCustomTransaction } from '@schemas/features/customAccounts/customTransaction'
import { post } from '@utils/shared/api/authenticatedHttp'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'
import { CUSTOM_ACCOUNTS_TAG_KEY } from '@api/businesses/[business-id]/custom-accounts/get'

type CreateCustomAccountTransactionsBody = {
  transactions: RawCustomTransaction[]
}

type CreateCustomAccountTransactionsArgs = CreateCustomAccountTransactionsBody & {
  customAccountId: string
}

const CreateCustomAccountTransactionsResponseSchema = UnwrappedDataResponseSchema(
  Schema.Array(BankTransactionDataOnlySchema),
)

const createCustomAccountTransactions = post<
  typeof CreateCustomAccountTransactionsResponseSchema.Encoded,
  CreateCustomAccountTransactionsBody,
  { businessId: string, customAccountId: string }
>(({ businessId, customAccountId }) =>
  `/v1/businesses/${businessId}/custom-accounts/${customAccountId}/transactions`,
)

export const usePostCustomAccountTransactions = createMutationHook({
  tags: [`${CUSTOM_ACCOUNTS_TAG_KEY}:create-transactions`],
  request: createCustomAccountTransactions,
  argToParams: ({ customAccountId }: CreateCustomAccountTransactionsArgs) => ({ customAccountId }),
  argToBody: ({ transactions }: CreateCustomAccountTransactionsArgs) => ({ transactions }),
  schema: CreateCustomAccountTransactionsResponseSchema,
  swrOptions: { throwOnError: false },
})
