import { useCallback } from 'react'
import { Schema } from 'effect'

import { BankTransactionDataOnlySchema } from '@schemas/bankTransactions/bankTransactionDataOnly'
import type { RawCustomTransaction } from '@schemas/customAccounts'
import { post } from '@utils/api/authenticatedHttp'
import { CUSTOM_ACCOUNTS_TAG_KEY } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

type CreateCustomAccountTransactionsBody = {
  transactions: RawCustomTransaction[]
}

type CreateCustomAccountTransactionsArgs = CreateCustomAccountTransactionsBody & {
  customAccountId: string
}

const CreateCustomAccountTransactionsResponseSchema = Schema.Struct({
  data: Schema.Array(BankTransactionDataOnlySchema),
})

const createCustomAccountTransactions = post<
  typeof CreateCustomAccountTransactionsResponseSchema.Encoded,
  CreateCustomAccountTransactionsBody,
  { businessId: string, customAccountId: string }
>(({ businessId, customAccountId }) =>
  `/v1/businesses/${businessId}/custom-accounts/${customAccountId}/transactions`,
)

const useCreateCustomAccountTransactionsMutation = createMutationHook({
  tags: [`${CUSTOM_ACCOUNTS_TAG_KEY}:create-transactions`],
  request: createCustomAccountTransactions,
  argToParams: ({ customAccountId }: CreateCustomAccountTransactionsArgs) => ({ customAccountId }),
  argToBody: ({ transactions }: CreateCustomAccountTransactionsArgs) => ({ transactions }),
  schema: CreateCustomAccountTransactionsResponseSchema,
  swrOptions: { throwOnError: false },
})

export function useCreateCustomAccountTransactions() {
  const mutationResponse = useCreateCustomAccountTransactionsMutation()
  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)
      return triggerResult?.data
    },
    [originalTrigger],
  )

  return {
    trigger: stableProxiedTrigger,
    data: mutationResponse.data?.data,
    error: mutationResponse.error,
    isError: mutationResponse.isError,
    isMutating: mutationResponse.isMutating,
  }
}
