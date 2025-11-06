import type { Business } from '@internal-types/business'
import { get, put } from '@api/layer/authenticated_http'

export type UpdateBusinessBody = Partial<Business>

export const getBusiness = get<{
  data: Business
}>(({ businessId }) => `/v1/businesses/${businessId}`)

export const updateBusiness = put<
  { data: Business },
  UpdateBusinessBody,
  { businessId: string }>(
  ({ businessId }) => `/v1/businesses/${businessId}`,
)
