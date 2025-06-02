import { useAuth } from '../useAuth'
import useSWRMutation from 'swr/mutation'
import { postWithFormData } from '../../api/layer/authenticated_http'
import { useLayerContext } from '../../contexts/LayerContext'
import { CUSTOM_ACCOUNTS_TAG_KEY } from './useCustomAccounts'
import type { CustomAccountTransactionRow, RawCustomTransaction } from './types'
import type { PreviewCsv } from '../../components/CsvUpload/types'

type CustomAccountParseCsvArgs = {
  file: File
  customAccountId: string
}

export type CustomAccountParseCsvResponse = {
  is_valid: boolean
  new_transactions_request: { transactions: RawCustomTransaction[] }
  new_transactions_preview: PreviewCsv<CustomAccountTransactionRow>
}

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
      tags: [`${CUSTOM_ACCOUNTS_TAG_KEY}:parse-csv`],
    } as const
  }
}

const parseCsv = (baseUrl: string, accessToken: string, {
  businessId,
  customAccountId,
  file,
}: {
  businessId: string
  customAccountId: string
  file: File
}) => {
  const formData = new FormData()
  formData.append('file', file)

  const endpoint = `/v1/businesses/${businessId}/custom-accounts/${customAccountId}/parse-csv`
  return postWithFormData<
    { data: CustomAccountParseCsvResponse }
  >(
    endpoint,
    formData,
    baseUrl,
    accessToken,
  )
}

export function useCustomAccountParseCsv() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  return useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: { customAccountId, file } }: { arg: CustomAccountParseCsvArgs },
    ) => parseCsv(
      apiUrl,
      accessToken,
      {
        businessId,
        customAccountId,
        file,
      },
    ).then(({ data }) => data),
    {
      revalidate: false,
    },
  )
}
