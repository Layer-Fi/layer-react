import { Bill, BillPayment } from '../../types/bills'
import { get } from './authenticated_http'

export const getBills = get<{ data: Bill[] }>(
  ({ businessId }) => `/v1/businesses/${businessId}/bills`,
)

// @TODO - is this needed?
export const getBillPayments = get<{ data: BillPayment }>(
  ({ businessId }) => `/v1/businesses/${businessId}/bill/payments`,
)
