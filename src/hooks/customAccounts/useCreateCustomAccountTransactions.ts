import useSWRMutation from 'swr/mutation'
import { post } from '../../api/layer/authenticated_http'
import type { RawCustomTransaction } from './types'
import { useAuth } from '../useAuth'
import { useLayerContext } from '../../contexts/LayerContext/LayerContext'
import { CUSTOM_ACCOUNTS_TAG_KEY } from './useCustomAccounts'
import { BankTransaction } from '../../types/bank_transactions'
import { APIError } from '../../models/APIError'

type CreateCustomAccountTransactionsBody = {
  transactions: RawCustomTransaction[]
}

type CreateCustomAccountTransactionsArgs = CreateCustomAccountTransactionsBody & {
  customAccountId: string
}

type CreateCustomAccountTransactionsResponse = {
  data: BankTransaction[]
}

const createCustomAccountTransactions = post<
  CreateCustomAccountTransactionsResponse,
  CreateCustomAccountTransactionsBody,
  { businessId: string, customAccountId: string }
>(({ businessId, customAccountId }) =>
  `/v1/businesses/${businessId}/custom-accounts/${customAccountId}/transactions`,
)

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: [`${CUSTOM_ACCOUNTS_TAG_KEY}:create-transactions`],
    } as const
  }
  return null
}

export function useCreateCustomAccountTransactions() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  return useSWRMutation<
    CreateCustomAccountTransactionsResponse['data'],
    APIError,
    () => ReturnType<typeof buildKey>,
    CreateCustomAccountTransactionsArgs>(
      () => buildKey({
        ...data,
        businessId,
      }),
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
        }).then(({ data }) => data),
      {
        revalidate: false,
        throwOnError: false,
      },
      )
}
