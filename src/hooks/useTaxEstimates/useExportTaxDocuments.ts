import useSWRMutation from 'swr/mutation'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { exportTaxDocuments } from '@api/layer/taxEstimates'
import { TAX_ESTIMATES_TAG_KEY } from './useTaxEstimates'

type ExportTaxDocumentsParams = {
  type: 'tax-packet' | 'schedule-c' | 'payment-history'
  year?: number
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
      tags: [`${TAX_ESTIMATES_TAG_KEY}#export-tax-documents`],
    } as const
  }
}

export function useExportTaxDocuments() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const swrMutationResponse = useSWRMutation(
    () => buildKey({
      ...auth,
      businessId,
    }),
    async ({ accessToken, apiUrl, businessId }, { arg }: { arg: ExportTaxDocumentsParams }) => {
      return exportTaxDocuments(
        apiUrl,
        accessToken,
        {
          params: {
            businessId,
            type: arg.type,
            year: arg.year ? String(arg.year) : undefined,
          },
          body: {},
        },
      )
    },
  )

  return swrMutationResponse
}
