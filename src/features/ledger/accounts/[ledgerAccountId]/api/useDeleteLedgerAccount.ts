import useSWRMutation from 'swr/mutation'
import { useAuth } from '@hooks/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { del } from '@api/layer/authenticated_http'

const deleteAccountFromLedger = del<
  Record<string, never>,
  { accountId: string, businessId: string }
>(({ businessId, accountId }) => `/v1/businesses/${businessId}/ledger/accounts/${accountId}`)

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
      tags: ['#delete-account-from-ledger'],
    } as const
  }
}

export function useDeleteAccountFromLedger() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: { accountId } }: { arg: { accountId: string } },
    ) => deleteAccountFromLedger(
      apiUrl,
      accessToken,
      {
        params: { businessId, accountId },
      },
    ),
    {
      revalidate: false,
      throwOnError: true,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return originalTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
