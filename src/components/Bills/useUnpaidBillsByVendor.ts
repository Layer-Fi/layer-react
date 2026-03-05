import useSWR from 'swr'

import type { Metadata } from '@internal-types/api'
import type { Bill } from '@internal-types/bills'
import { get } from '@utils/authenticatedHttp'

type GetBillsReturn = {
  data?: Bill[]
  meta?: Metadata
  error?: unknown
}

interface GetBillsParams extends Record<string, string | undefined> {
  businessId: string
  cursor?: string
  startDate?: string
  endDate?: string
  status?: string
  vendorId?: string
}

const getBills = get<GetBillsReturn, GetBillsParams>(
  ({ businessId, startDate, endDate, status, vendorId, cursor, limit = 15 }) => `/v1/businesses/${businessId}/bills?${
    vendorId ? `&vendor_id=${vendorId}` : ''
  }${
    cursor ? `&cursor=${cursor}` : ''
  }${
    startDate ? `&received_at_start=${startDate}` : ''
  }${
    endDate ? `&received_at_end=${endDate}` : ''
  }${
    status ? `&status=${status}` : ''
  }&limit=${limit}&sort_by=received_at&sort_order=DESC`,
)
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
      getBills(apiUrl, accessToken, {
        params: {
          businessId,
          status: 'RECEIVED,PARTIALLY_PAID',
          vendorId,
          limit: '50',
        },
      })().then(response => response.data),
  )
}
