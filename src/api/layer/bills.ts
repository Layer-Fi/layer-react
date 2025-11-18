import type { Metadata } from '@internal-types/api'
import { type Bill, type BillLineItem, type BillPayment, type SalesTax } from '@internal-types/bills'
import { get, post } from '@api/layer/authenticated_http'

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

export type SaveBillPayload = {
  bill_number?: string
  terms?: string
  due_at?: string
  received_at?: string
  vendor_id?: string
  vendor_external_id?: string
  sales_taxes?: SalesTax[]
  line_items?: Partial<BillLineItem>[]
}

export const getBills = get<
  GetBillsReturn,
  GetBillsParams
>(
  ({ businessId, startDate, endDate, status, vendorId, cursor, limit = 15 }) => `/v1/businesses/${businessId}/bills?${
    vendorId ? `&vendor_id=${vendorId}` : ''
  }${
    cursor ? `&cursor=${cursor}` : ''
  }${
    startDate ? `&received_at_start=${startDate}` : ''
  }${
    endDate ? `&received_at_end=${endDate}` : ''
  }${
    status ? `&status=${status}` : ''
  }&limit=${limit}&sort_by=received_at&sort_order=DESC`,
)

export const getBill = get<{ data: Bill }, { businessId: string, billId: string }>(
  ({ businessId, billId }) => `/v1/businesses/${businessId}/bills/${billId}`,
)

export const updateBill = post<{ data: Bill }, SaveBillPayload>(
  ({ businessId, billId }) => `/v1/businesses/${businessId}/bills/${billId}/update`,
)

export const createBill = post<{ data: Bill }, SaveBillPayload>(
  ({ businessId }) => `/v1/businesses/${businessId}/bills`,
)

export const createBillPayment = post<{ data: BillPayment }, BillPayment>(
  ({ businessId }) => `/v1/businesses/${businessId}/bills/bill-payments`,
)
