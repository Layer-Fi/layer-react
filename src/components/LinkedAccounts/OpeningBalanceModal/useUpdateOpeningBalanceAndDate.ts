import useSWRMutation from 'swr/mutation'
import { Layer } from '../../../api/layer'
import type { Awaitable } from '../../../types/utility/promises'
import { useAuth } from '../../../hooks/useAuth'
import { useLayerContext } from '../../../contexts/LayerContext'
import { AccountFormBoxData } from '../AccountFormBox/AccountFormBox'
import { useState } from 'react'

export type ErrorType = 'MISSING_DATE' | 'MISSING_BALANCE' | 'API_ERROR'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
}) {
  return {
    accessToken,
    apiUrl,
    businessId,
    tags: ['#linked-accounts', '#opening-balance', '#update'],
  }
}

export function useUpdateOpeningBalanceAndDate(
  { onSuccess }: { onSuccess: () => Awaitable<unknown> },
) {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, ErrorType[]>>({})
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const validate = ({
    openingBalance: openingBalance,
    openingDate: openingDate,
  }: AccountFormBoxData) => {
    const errors: ErrorType[] = []

    if (!openingDate) {
      errors.push('MISSING_DATE')
    }

    if (!openingBalance) {
      errors.push('MISSING_BALANCE')
    }

    return errors
  }

  const updateData = ({
    account: { id: accountId },
    openingBalance: openingBalance,
    openingDate: openingDate,
  }: AccountFormBoxData) => {
    if (!openingDate || !openingBalance) {
      return
    }

    return Layer.updateOpeningBalance(
      auth?.apiUrl ?? '',
      auth?.access_token,
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

  const { trigger } = useSWRMutation(
    () => buildKey({ ...auth, businessId }),
    async (_key, { arg }: { arg: AccountFormBoxData }) => updateData(arg),
  )

  const bulkUpdate = async (data: AccountFormBoxData[]) => {
    setIsLoading(true)

    try {
      const newErrors: Record<string, ErrorType[]> = {}
      const savedIds: string[] = []

      const updatePromises = data.map(async (item) => {
        try {
          const errors = validate(item)
          if (errors.length > 0) {
            newErrors[item.account.id] = errors
            return
          }

          const result = await trigger(item)
          if (result) {
            savedIds.push(item.account.id)
          }
          else {
            newErrors[item.account.id] = ['API_ERROR']
          }

          return
        }
        catch {
          newErrors[item.account.id] = ['API_ERROR']
          return
        }
      })

      await Promise.all(updatePromises)

      setErrors(newErrors)

      if (Object.keys(newErrors).length === 0) {
        onSuccess()
      }

      return savedIds
    }
    catch {
      return []
    }
    finally {
      setIsLoading(false)
    }
  }

  return { bulkUpdate, isLoading, errors }
}
