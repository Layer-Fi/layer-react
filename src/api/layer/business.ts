import { Business } from '../../types'
import { get, put } from './authenticated_http'

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
