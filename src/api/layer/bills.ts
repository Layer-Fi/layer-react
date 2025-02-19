import { Metadata } from '../../types'
import { Bill } from '../../types/bills'
import { get } from './authenticated_http'

export type GetBillsReturn = {
  data?: Bill[]
  meta?: Metadata
  error?: unknown
}

export interface GetBillsParams
  extends Record<string, string | undefined> {
  businessId: string
  cursor?: string
  startDate?: string
  endDate?: string
  status?: string
  vendorId?: string
}

export const getBills = get<
  GetBillsReturn,
  GetBillsParams
>(
  ({ businessId, startDate, endDate, status, vendorId, cursor }) => `/v1/businesses/${businessId}/bills?${
    vendorId ? `&vendor_id=${vendorId}` : ''
  }${
    cursor ? `&cursor=${cursor}` : ''
  }&limit=5`,
  // ({ businessId, startDate, endDate, status }) => `/v1/businesses/${businessId}/bills?received_at_start=${startDate}&received_at_end=${endDate}&status=${status}`,
  // ({ businessId, startDate, endDate }) => `/v1/businesses/${businessId}/bills?status=PAID`,
)
