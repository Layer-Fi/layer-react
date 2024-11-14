import { Business } from '../../types'
import { get } from './authenticated_http'

export const getBusiness = get<
  { data: Business }
  >(({ businessId }) => `/v1/businesses/${businessId}`)
