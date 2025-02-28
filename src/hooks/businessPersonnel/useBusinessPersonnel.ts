import { useLayerContext } from '../../contexts/LayerContext'
import { useAuth } from '../useAuth'
import { get } from '../../api/layer/authenticated_http'
import useSWR from 'swr'
import { filterReadonly, mapReadonly } from '../../utils/array/readonlyTransformations'
import {
  isPersonnelRole,
  type BusinessPersonnel,
  type PersonnelRole,
  type RawBusinessPersonnel,
} from './types'

export const BUSINESS_PERSONNEL_TAG_KEY = '#business-personnel'

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
      tags: [BUSINESS_PERSONNEL_TAG_KEY],
    } as const
  }
}

const getBusinessPersonnel = get<
  {
    data: ReadonlyArray<RawBusinessPersonnel>
  },
  {
    businessId: string
  }
>(({ businessId }) => `/v1/businesses/${businessId}/personnel`)

export function useBusinessPersonnel() {
  const { data } = useAuth()
  const { businessId } = useLayerContext()

  return useSWR(
    () => buildKey({
      ...data,
      businessId,
    }),
    ({ accessToken, apiUrl, businessId }) => getBusinessPersonnel(
      apiUrl,
      accessToken,
      {
        params: { businessId },
      },
    )().then(({ data }) => data.map(({
      id,
      full_name: fullName,
      preferred_name: preferredName,
      external_id: externalId,
      email_addresses,
      phone_numbers,
      roles,
    }) => ({
      id,
      fullName,
      preferredName,
      externalId,
      emailAddresses: mapReadonly(
        email_addresses,
        ({ id, email_address: emailAddress }) => ({ id, emailAddress }),
      ),
      phoneNumbers: mapReadonly(
        phone_numbers,
        ({ id, phone_number: phoneNumber }) => ({ id, phoneNumber }),
      ),
      roles: filterReadonly(
        roles,
        (roleEntity): roleEntity is typeof roleEntity & { role: PersonnelRole } => isPersonnelRole(roleEntity.role),
      ),
    } satisfies BusinessPersonnel))),
  )
}
