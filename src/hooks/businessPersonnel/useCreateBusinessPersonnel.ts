import useSWRMutation from 'swr/mutation'
import { post } from '../../api/layer/authenticated_http'
import type { BusinessPersonnel, PersonnelRole, RawBusinessPersonnel } from './types'
import { useAuth } from '../useAuth'
import { useLayerContext } from '../../contexts/LayerContext'
import { useSWRConfig } from 'swr'
import { withSWRKeyTags } from '../../utils/swr/withSWRKeyTags'
import { BUSINESS_PERSONNEL_TAG_KEY } from './useBusinessPersonnel'
import { useCallback } from 'react'

type CreateBusinessPersonnelBody = Pick<
  RawBusinessPersonnel,
  'full_name' | 'preferred_name' | 'external_id'
> & {
  email_addresses: ReadonlyArray<{ email_address: string }>
  phone_numbers: ReadonlyArray<{ phone_number: string }>
  roles: ReadonlyArray<{ role: PersonnelRole }>
}

const createBusinessPersonnel = post<
  { data: BusinessPersonnel },
  CreateBusinessPersonnelBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/personnel`)

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
      tags: [`${BUSINESS_PERSONNEL_TAG_KEY}:create`],
    } as const
  }
}

export function useCreateBusinessPersonnel() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const mutationResponse = useSWRMutation(
    () => buildKey({
      ...data,
      businessId,
    }),
    (
      { accessToken, apiUrl, businessId },
      { arg: body }: { arg: CreateBusinessPersonnelBody },
    ) => createBusinessPersonnel(
      apiUrl,
      accessToken,
      {
        params: { businessId },
        body,
      },
    ).then(({ data }) => data),
    {
      revalidate: false,
      throwOnError: false,
    },
  )

  const { trigger: originalTrigger } = mutationResponse

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const result = await originalTrigger(...triggerParameters)

      if (result) {
        await mutate(key => withSWRKeyTags(
          key,
          tags => tags.includes(BUSINESS_PERSONNEL_TAG_KEY),
        ))
      }

      return result
    },
    [originalTrigger, mutate],
  )

  return new Proxy(mutationResponse, {
    get(target, prop) {
      if (prop === 'trigger') {
        return stableProxiedTrigger
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return Reflect.get(target, prop)
    },
  })
}
