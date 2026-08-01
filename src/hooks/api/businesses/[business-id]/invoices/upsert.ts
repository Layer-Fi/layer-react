import { type UpdateParams, usePatchInvoice } from '@api/businesses/[business-id]/invoices/[invoice-id]/patch'
import { type CreateParams, usePostInvoice } from '@api/businesses/[business-id]/invoices/post'

export type UpsertParams = CreateParams | UpdateParams

export enum UpsertInvoiceMode {
  Create = 'Create',
  Update = 'Update',
}

type UseUpsertInvoiceProps =
  | { mode: UpsertInvoiceMode.Create }
  | { mode: UpsertInvoiceMode.Update, invoiceId: string }

export const useUpsertInvoice = (props: UseUpsertInvoiceProps) => {
  const { mode } = props
  const invoiceId = mode === UpsertInvoiceMode.Update ? props.invoiceId : undefined

  const createResponse = usePostInvoice()
  const updateResponse = usePatchInvoice({
    invoiceId: invoiceId ?? '',
  })

  return mode === UpsertInvoiceMode.Create ? createResponse : updateResponse
}
