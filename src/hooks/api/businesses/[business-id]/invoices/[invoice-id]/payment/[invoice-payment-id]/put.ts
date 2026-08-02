import { put } from '@utils/api/authenticatedHttp'
import {
  UPSERT_INVOICE_PAYMENT_TAG_KEY,
  type UpsertDedicatedInvoicePaymentBody,
  type UpsertDedicatedInvoicePaymentReturnEncoded,
  UpsertDedicatedInvoicePaymentReturnSchema,
  useDedicatedInvoicePaymentTriggerSuccess,
} from '@api/businesses/[business-id]/invoices/[invoice-id]/payment/post'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

export type UpdateParams = {
  readonly businessId: string
  readonly invoiceId: string
  readonly invoicePaymentId: string
}

const updateDedicatedInvoicePayment = put<
  UpsertDedicatedInvoicePaymentReturnEncoded,
  UpsertDedicatedInvoicePaymentBody,
  UpdateParams
>(({ businessId, invoiceId, invoicePaymentId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/payment/${invoicePaymentId}`)

export const usePutDedicatedInvoicePayment = createMutationHook({
  tags: [UPSERT_INVOICE_PAYMENT_TAG_KEY],
  request: updateDedicatedInvoicePayment,
  keyParams: ['invoiceId', 'invoicePaymentId'],
  schema: UpsertDedicatedInvoicePaymentReturnSchema,
  swrOptions: { throwOnError: true },
  useOnTriggerSuccess: useDedicatedInvoicePaymentTriggerSuccess,
})
