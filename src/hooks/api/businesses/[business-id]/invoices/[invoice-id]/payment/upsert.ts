import { type UpdateParams, usePutDedicatedInvoicePayment } from '@api/businesses/[business-id]/invoices/[invoice-id]/payment/[invoice-payment-id]/put'
import { type CreateParams, usePostDedicatedInvoicePayment } from '@api/businesses/[business-id]/invoices/[invoice-id]/payment/post'

export type UpsertParams = CreateParams | UpdateParams

export enum UpsertDedicatedInvoicePaymentMode {
  Create = 'Create',
  Update = 'Update',
}

type UseUpsertDedicatedInvoicePaymentProps =
  | { mode: UpsertDedicatedInvoicePaymentMode.Create, invoiceId: string }
  | { mode: UpsertDedicatedInvoicePaymentMode.Update, invoiceId: string, invoicePaymentId: string }

export const useUpsertDedicatedInvoicePayment = (props: UseUpsertDedicatedInvoicePaymentProps) => {
  const { mode, invoiceId } = props
  const invoicePaymentId = mode === UpsertDedicatedInvoicePaymentMode.Update ? props.invoicePaymentId : undefined

  const createResponse = usePostDedicatedInvoicePayment({ invoiceId })
  const updateResponse = usePutDedicatedInvoicePayment({
    invoiceId,
    invoicePaymentId: invoicePaymentId ?? '',
  })

  return mode === UpsertDedicatedInvoicePaymentMode.Create ? createResponse : updateResponse
}
