import useSWRMutation from 'swr/mutation'

import type { Awaitable } from '@internal-types/utility/promises'
import { post } from '@api/layer/authenticated_http'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

type UpdateBankAccountOpeningBalanceBody = {
  effective_at: string
  balance: number
}

const updateBankAccountOpeningBalance = post<
  never,
  UpdateBankAccountOpeningBalanceBody,
  {
    businessId: string
    bankAccountId: string
  }
>(
  ({ businessId, bankAccountId }) =>
    `/v1/businesses/${businessId}/bank-accounts/${bankAccountId}/opening-balance`,
)

export type OpeningBalanceData = { bankAccountId: string, openingDate?: Date, openingBalance?: number, isDateInvalid: boolean }

type OpeningBalanceAPIResponseValidationError = {
  bankAccountId: string
  status: 'rejected'
  reason: {
    cause: {
      type: 'validation'
      errors: string[]
      bankAccountId: string
    }
  }
}

type OpeningBalanceAPIResponseError = {
  bankAccountId: string
  status: 'rejected'
  reason: {
    code?: number
    info?: string
    messages?: Record<string, string>[]
    name?: string
  }
}

export type OpeningBalanceAPIResponseResult =
  | { bankAccountId: string, status: 'fulfilled', value: { data: { type: string } } }
  | OpeningBalanceAPIResponseValidationError
  | OpeningBalanceAPIResponseError

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  data,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  data: OpeningBalanceData[]
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      data,
      tags: ['#update-opening-balance'],
    } as const
  }
}

function setOpeningBalanceOnBankAccount({
  apiUrl,
  accessToken,
  businessId,
  bankAccountId,
  openingDate,
  openingBalance,
}: {
  apiUrl: string
  accessToken: string
  businessId: string
  bankAccountId: string
  openingDate: Date
  openingBalance: number
}) {
  return updateBankAccountOpeningBalance(
    apiUrl,
    accessToken,
    {
      params: {
        businessId,
        bankAccountId,
      },
      body: {
        effective_at: openingDate.toISOString(),
        balance: openingBalance,
      },
    },
  )
}

export function useBulkSetOpeningBalanceAndDate(
  data: OpeningBalanceData[],
  { onSuccess }: { onSuccess: (results: OpeningBalanceAPIResponseResult[]) => Awaitable<void> },
) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const validate = ({ openingBalance, openingDate, isDateInvalid }: OpeningBalanceData) => {
    const errors: string[] = []

    if (!openingDate) {
      errors.push('MISSING_DATE')
    }

    if (isDateInvalid) {
      errors.push('INVALID_DATE')
    }

    if (!openingBalance) {
      errors.push('MISSING_BALANCE')
    }

    return errors
  }

  return useSWRMutation(
    () => buildKey({ access_token: auth?.access_token, apiUrl: auth?.apiUrl, businessId, data }),
    ({ accessToken, apiUrl, businessId, data }) => (
      Promise.allSettled(
        data.map(
          ({ bankAccountId, openingDate, openingBalance, isDateInvalid }) => {
            const errors = validate({ bankAccountId, openingDate, openingBalance, isDateInvalid })
            if (errors.length > 0) {
              return Promise.reject(
                new Error('Invalid data', {
                  cause: {
                    type: 'validation',
                    errors,
                    bankAccountId,
                  },
                }),
              )
            }

            if (!openingDate || openingBalance === undefined) {
              return Promise.reject(
                new Error('Invalid data', {
                  cause: { type: 'validation', errors: ['MISSING_FIELDS'], bankAccountId },
                }),
              )
            }

            return setOpeningBalanceOnBankAccount({
              accessToken,
              apiUrl,
              businessId,
              bankAccountId,
              openingDate,
              openingBalance,
            })
          }),
      )
    )
      .then((results) => {
        const resultsWithIds: OpeningBalanceAPIResponseResult[] = results.map((r, i) => ({
          ...r,
          bankAccountId: data[i].bankAccountId,
        }))
        return onSuccess?.(resultsWithIds)
      })
      .then(() => true as const),
    {
      revalidate: false,
      throwOnError: false,
    },
  )
}
