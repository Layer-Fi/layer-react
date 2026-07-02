import { Schema } from 'effect'
import useSWRMutation from 'swr/mutation'

import { BankTransactionDataOnlySchema } from '@schemas/bankTransactions/bankTransactionDataOnly'
import type { RawCustomTransaction } from '@schemas/customAccounts'
import { type APIError } from '@utils/api/apiError'
import { post } from '@utils/api/authenticatedHttp'
import { createBuildKey } from '@utils/swr/createBuildKey'
import { CUSTOM_ACCOUNTS_TAG_KEY } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
import { useBuildKeyInputs } from '@hooks/utils/swr/useBuildKeyInputs'

type CreateCustomAccountTransactionsBody = {
  transactions: RawCustomTransaction[]
}

type CreateCustomAccountTransactionsArgs = CreateCustomAccountTransactionsBody & {
  customAccountId: string
}

const CreateCustomAccountTransactionsResponseSchema = Schema.Struct({
  data: Schema.Array(BankTransactionDataOnlySchema),
})

type CreateCustomAccountTransactionsResponse = typeof CreateCustomAccountTransactionsResponseSchema.Type

const createCustomAccountTransactions = post<
  Record<string, unknown>,
  CreateCustomAccountTransactionsBody,
  { businessId: string, customAccountId: string }
>(({ businessId, customAccountId }) =>
  `/v1/businesses/${businessId}/custom-accounts/${customAccountId}/transactions`,
)

const buildKey = createBuildKey<{ businessId: string }>([`${CUSTOM_ACCOUNTS_TAG_KEY}:create-transactions`])

export function useCreateCustomAccountTransactions() {
  const { withLocale, businessId, auth } = useBuildKeyInputs()

  return useSWRMutation<
    CreateCustomAccountTransactionsResponse['data'],
    APIError,
    () => ReturnType<typeof buildKey>,
    CreateCustomAccountTransactionsArgs>(
      () => withLocale(buildKey({
        ...auth,
        businessId,
      })),
      (
        { accessToken, apiUrl, businessId },
        { arg: { customAccountId, ...body } },
      ) =>
        createCustomAccountTransactions(apiUrl, accessToken, {
          params: {
            businessId,
            customAccountId,
          },
          body,
        })
          .then(Schema.decodeUnknownPromise(CreateCustomAccountTransactionsResponseSchema))
          .then(({ data }) => data),
      {
        revalidate: false,
        throwOnError: false,
      },
      )
}
