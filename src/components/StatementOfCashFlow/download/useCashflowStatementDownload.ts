import useSWRMutation from 'swr/mutation'
import { useLayerContext } from '../../../contexts/LayerContext'
import { useAuth } from '../../../hooks/useAuth'
import type { S3PresignedUrl } from '../../../types/general'
import type { Awaitable } from '../../../types/utility/promises'
import { getCashflowStatementCSV } from '../../../api/layer/statement-of-cash-flow'

const DOWNLOAD_CASHFLOW_STATEMENT_TAG_KEY = '#download-cashflow-statement'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  startDate,
  endDate,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  startDate: Date
  endDate: Date
}) {
  if (accessToken && apiUrl) {
    return {
      accessToken,
      apiUrl,
      businessId,
      startDate,
      endDate,
      tags: [DOWNLOAD_CASHFLOW_STATEMENT_TAG_KEY],
    }
  }
}

type UseCashflowStatementDownloadOptions = {
  startDate: Date
  endDate: Date
  onSuccess?: (url: S3PresignedUrl) => Awaitable<unknown>
}

export function useCashflowStatementDownload({
  startDate,
  endDate,
  onSuccess,
}: UseCashflowStatementDownloadOptions) {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  return useSWRMutation(
    () => buildKey({
      ...auth,
      businessId,
      startDate,
      endDate,
    }),
    ({ accessToken, apiUrl, businessId, startDate, endDate }) => getCashflowStatementCSV(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          startDate,
          endDate,
        },
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
