import useSWR from 'swr'

import { Layer } from '@api/layer'
import { useAuth } from '@hooks/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  vendorId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  vendorId?: string
}) {
  if (accessToken && apiUrl && vendorId) {
    return {
      accessToken,
      apiUrl,
      businessId,
      vendorId,
      tags: ['#unpaid-bills-by-vendor'],
    } as const
  }
}

export const useUnpaidBillsByVendor = (
  { vendorId }: { vendorId?: string },
) => {
  const { businessId } = useLayerContext()
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()

  return useSWR(
    () => buildKey({
      ...auth,
      apiUrl,
      businessId,
      vendorId,
    }),
    ({ accessToken, apiUrl, businessId, vendorId }) =>
      Layer.getBills(apiUrl, accessToken, {
        params: {
          businessId,
          status: 'RECEIVED,PARTIALLY_PAID',
          vendorId,
          limit: '50',
        },
      })().then(response => response.data),
  )
}
