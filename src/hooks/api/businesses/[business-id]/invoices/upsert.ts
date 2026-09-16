import { createUpsertHook } from '@hooks/utils/swr/createUpsertHook'
import { type UpdateParams, usePatchInvoice } from '@api/businesses/[business-id]/invoices/[invoice-id]/patch'
import { type CreateParams, usePostInvoice } from '@api/businesses/[business-id]/invoices/post'

export type UpsertParams = CreateParams | UpdateParams

export const useUpsertInvoice = createUpsertHook({
  useCreate: usePostInvoice,
  useUpdate: usePatchInvoice,
  toCreateOptions: () => undefined,
  toUpdateOptions: (props: { invoiceId: string }) => ({ invoiceId: props.invoiceId }),
})
