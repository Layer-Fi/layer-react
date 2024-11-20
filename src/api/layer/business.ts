import { Business } from '../../types'
import { get, put } from './authenticated_http'

export const getBusiness = get<{
  data: Business
}>(({ businessId }) => `/v1/businesses/${businessId}`)

export const updateBusiness = put<Record<never, never>>(
  ({ businessId }) => `/v1/businesses/${businessId}`)
