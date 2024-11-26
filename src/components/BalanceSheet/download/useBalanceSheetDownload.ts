import useSWRMutation from 'swr/mutation'
import { useLayerContext } from '../../../contexts/LayerContext'
import { useAuth } from '../../../hooks/useAuth'
import { getBalanceSheetCSV } from '../../../api/layer/balance_sheet'
import type { S3PresignedUrl } from '../../../types/general'
import type { Awaitable } from '../../../types/utility/promises'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  effectiveDate,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  effectiveDate: Date
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      effectiveDate,
      tags: [ '#balance-sheet', '#exports', '#csv' ],
    }
  }
}

type UseBalanceSheetOptions = {
  effectiveDate: Date
  onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>
}

export function useBalanceSheetDownload({
  effectiveDate,
  onSuccess,
}: UseBalanceSheetOptions) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWRMutation(
    () => buildKey({
      ...auth,
      businessId,
      effectiveDate,
    }),
    ({ accessToken, apiUrl, businessId, effectiveDate, }) => getBalanceSheetCSV(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          effectiveDate: effectiveDate.toISOString(),
        }
      })().then(({ data }) => {
      if (onSuccess) {
        return onSuccess(data)
      }
    }),
    {
      revalidate: false,
      throwOnError: false,
    },
  )
}
