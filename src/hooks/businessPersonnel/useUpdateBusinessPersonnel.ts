import useSWRMutation from 'swr/mutation'
import { post } from '../../api/layer/authenticated_http'
import type { BusinessPersonnel, PersonnelRole, RawBusinessPersonnel } from './types'
import { useAuth } from '../useAuth'
import { useLayerContext } from '../../contexts/LayerContext'
import { useSWRConfig } from 'swr'
import { withSWRKeyTags } from '../../utils/swr/withSWRKeyTags'
import { BUSINESS_PERSONNEL_TAG_KEY } from './useBusinessPersonnel'

type UpdateBusinessPersonnelBody = {
  id: string
} & Partial<
  Pick<
    RawBusinessPersonnel,
    'full_name' | 'preferred_name' | 'external_id'
  > & {
    email_addresses: ReadonlyArray<{ email_address: string }>
    phone_numbers: ReadonlyArray<{ phone_number: string }>
    roles: ReadonlyArray<{ role: PersonnelRole }>
  }
>

const updateBusinessPersonnel = post<
  { data: BusinessPersonnel },
  UpdateBusinessPersonnelBody,
  {
    businessId: string
    businessPersonnelId: string
  }
>(({ businessId, businessPersonnelId }) => {
  return `/v1/businesses/${businessId}/personnel/${businessPersonnelId}/update`
})

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  businessPersonnelId,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  businessPersonnelId?: string
}) {
  if (accessToken && apiUrl && businessPersonnelId) {
    return {
      accessToken,
      apiUrl,
      businessId,
      businessPersonnelId,
      tags: [`${BUSINESS_PERSONNEL_TAG_KEY}:${businessPersonnelId}`],
    } as const
  }
}

export function useUpdateBusinessPersonnel({ businessPersonnelId }: { businessPersonnelId?: string }) {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
      businessPersonnelId,
    }),
    (
      { accessToken, apiUrl, businessId, businessPersonnelId },
      { arg: body }: { arg: UpdateBusinessPersonnelBody },
    ) => updateBusinessPersonnel(
      apiUrl,
      accessToken,
      {
        params: {
          businessId,
          businessPersonnelId,
        },
        body,
      },
    ).then(({ data }) => data),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  return Object.assign(
    mutationResponse,
    {
      trigger: async (...triggerParameters: Parameters<typeof originalTrigger>) => {
        const data = await originalTrigger(...triggerParameters)

        if (data) {
          await mutate(key => withSWRKeyTags(key, tags => tags.includes(BUSINESS_PERSONNEL_TAG_KEY)))
        }

        return data
      },
    })
}
