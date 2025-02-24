import { Bill } from '../../types/bills'
import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../../hooks/useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { Layer } from '../../api/layer'
import useSWR from 'swr'

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

type UseUnpaidBillsByVendor = ({ vendorId }: { vendorId?: string }) => {
  data: Bill[]
  isLaoding?: boolean
}

export const useUnpaidBillsByVendor: UseUnpaidBillsByVendor = (
  { vendorId }: { vendorId?: string },
) => {
  const { businessId } = useLayerContext()
  const { data: auth } = useAuth()
  const { apiUrl } = useEnvironment()

  const {
    data,
    isLoading,
  } = useSWR(
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
          status: 'RECEIVED', // @TODO - add also pariatlly_paid
          vendorId,
          limit: '50',
        },
      })().then(response => response.data),
  )

  return {
    data: data ?? [],
    isLoading,
  }
}
