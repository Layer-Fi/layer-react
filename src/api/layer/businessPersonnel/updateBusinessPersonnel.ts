import { post } from '../authenticated_http'
import type { BusinessPersonnel, PersonnelRole, RawBusinessPersonnel } from '../../../hooks/businessPersonnel/types'

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

export const updateBusinessPersonnel = post<
  { data: BusinessPersonnel },
  UpdateBusinessPersonnelBody,
  {
    businessId: string
    businessPersonnelId: string
  }
>(({ businessId, businessPersonnelId }) => {
  return `/v1/businesses/${businessId}/personnel/${businessPersonnelId}/update`
})
