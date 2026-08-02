import { type UpdateParams, usePutDedicatedInvoicePayment } from '@api/businesses/[business-id]/invoices/[invoice-id]/payment/[invoice-payment-id]/put'
import { type CreateParams, usePostDedicatedInvoicePayment } from '@api/businesses/[business-id]/invoices/[invoice-id]/payment/post'
import { createUpsertHook } from '@hooks/utils/swr/createUpsertHook'

export type UpsertParams = CreateParams | UpdateParams

export const useUpsertDedicatedInvoicePayment = createUpsertHook({
  useCreate: usePostDedicatedInvoicePayment,
  useUpdate: usePutDedicatedInvoicePayment,
  toCreateOptions: (props: { invoiceId: string }) => ({ invoiceId: props.invoiceId }),
  toUpdateOptions: (props: { invoiceId: string, invoicePaymentId: string }) => ({
    invoiceId: props.invoiceId,
    invoicePaymentId: props.invoicePaymentId,
  }),
})
