import useSWRMutation from 'swr/mutation'
import { Layer } from '../../../api/layer'
import type { Awaitable } from '../../../types/utility/promises'
import { useAuth } from '../../../hooks/useAuth'
import { useLayerContext } from '../../../contexts/LayerContext'

export type OpeningBalanceData = { accountId: string, openingDate?: Date, openingBalance?: number }

type OpeningBalanceAPIResponseValidationError = {
  accountId: string
  status: 'rejected'
  reason: {
    cause: {
      type: 'validation'
      errors: string[]
      accountId: string
    }
  }
}

type OpeningBalanceAPIResponseError = {
  accountId: string
  status: 'rejected'
  reason: {
    code?: number
    info?: string
    messages?: Record<string, string>[]
    name?: string
  }
}

export type OpeningBalanceAPIResponseResult =
  | { accountId: string, status: 'fulfilled', value: { data: { type: string } } }
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
      tags: ['#linked-accounts', '#opening-balance'],
    } as const
  }
}

function setOpeningBalanceOnAccount({
  apiUrl,
  accessToken,
  businessId,
  accountId,
  openingDate,
  openingBalance,
}: {
  apiUrl: string
  accessToken: string
  businessId: string
  accountId: string
  openingDate: Date
  openingBalance: number
}) {
  return Layer.updateOpeningBalance(
    apiUrl,
    accessToken,
    {
      params: {
        businessId,
        accountId,
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

  const validate = ({ openingBalance, openingDate }: OpeningBalanceData) => {
    const errors: string[] = []

    if (!openingDate) {
      errors.push('MISSING_DATE')
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
          ({ accountId, openingDate, openingBalance }) => {
            const errors = validate({ accountId, openingDate, openingBalance })
            if (errors.length > 0) {
              return Promise.reject(
                new Error('Invalid data', {
                  cause: {
                    type: 'validation',
                    errors,
                    accountId,
                  },
                }),
              )
            }

            return setOpeningBalanceOnAccount({
              accessToken,
              apiUrl,
              businessId,
              accountId,
              openingDate: openingDate as Date,
              openingBalance: openingBalance as number,
            })
          }),
      )
    )
      .then((results) => {
        const resultsWithIds: OpeningBalanceAPIResponseResult[] = results.map((r, i) => ({
          ...r,
          accountId: data[i].accountId,
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
