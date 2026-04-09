import { useCallback } from 'react'
import { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'

import type { BusinessPersonnel, PersonnelRole, RawBusinessPersonnel } from '@internal-types/businessPersonnel'
import { post } from '@utils/api/authenticatedHttp'
import { useLocalizedKey } from '@utils/swr/localeKeyMiddleware'
import { withSWRKeyTags } from '@utils/swr/withSWRKeyTags'
import { BUSINESS_PERSONNEL_TAG_KEY } from '@hooks/api/businesses/[business-id]/personnel/useBusinessPersonnel'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export type UpdateBusinessPersonnelBody = {
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
  const withLocale = useLocalizedKey()
  const { data } = useAuth()
  const { businessId } = useLayerContext()
  const { mutate } = useSWRConfig()

  const mutationResponse = useSWRMutation(
    () => withLocale(buildKey({
      ...data,
      businessId,
      businessPersonnelId,
    })),
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

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void mutate(key => withSWRKeyTags(
        key,
        ({ tags }) => tags.includes(BUSINESS_PERSONNEL_TAG_KEY),
      ))

      return triggerResult
    },
    [
      originalTrigger,
      mutate,
    ],
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
