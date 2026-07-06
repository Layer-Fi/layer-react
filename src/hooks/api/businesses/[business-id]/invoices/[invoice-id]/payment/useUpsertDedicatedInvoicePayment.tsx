import { useCallback } from 'react'

import { type Invoice, InvoiceStatus } from '@schemas/invoices/invoice'
import { type InvoicePayment, InvoicePaymentSchema, type UpsertDedicatedInvoicePaymentSchema } from '@schemas/invoices/invoicePayment'
import { UnwrappedDataResponseSchema } from '@schemas/utils'
import { post, put } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useInvoiceSummaryStatsCacheActions } from '@hooks/api/businesses/[business-id]/invoices/summary-stats/useInvoiceSummaryStats'
import { useInvoicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/invoices/useListInvoices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPSERT_INVOICE_PAYMENT_TAG_KEY = '#upsert-dedicated-invoice-payment'

export enum UpsertDedicatedInvoicePaymentMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertDedicatedInvoicePaymentBody = typeof UpsertDedicatedInvoicePaymentSchema.Encoded

const UpsertDedicatedInvoicePaymentReturnSchema = UnwrappedDataResponseSchema(InvoicePaymentSchema)

type UpsertDedicatedInvoicePaymentReturnEncoded = typeof UpsertDedicatedInvoicePaymentReturnSchema.Encoded

const createDedicatedInvoicePayment = post<
  UpsertDedicatedInvoicePaymentReturnEncoded,
  UpsertDedicatedInvoicePaymentBody,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/payment/`)

const updateDedicatedInvoicePayment = put<
  UpsertDedicatedInvoicePaymentReturnEncoded,
  UpsertDedicatedInvoicePaymentBody,
  { businessId: string, invoiceId: string, invoicePaymentId: string }
>(({ businessId, invoiceId, invoicePaymentId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}/payment/${invoicePaymentId}`)

export type CreateParams = {
  readonly businessId: string
  readonly invoiceId: string
}

export type UpdateParams = {
  readonly businessId: string
  readonly invoiceId: string
  readonly invoicePaymentId: string
}

export type UpsertParams = CreateParams | UpdateParams

const useCreateDedicatedInvoicePayment = createMutationHook({
  tags: [UPSERT_INVOICE_PAYMENT_TAG_KEY],
  request: createDedicatedInvoicePayment,
  keyParamNames: ['invoiceId'],
  schema: UpsertDedicatedInvoicePaymentReturnSchema,
  swrOptions: { throwOnError: true },
})

const useUpdateDedicatedInvoicePayment = createMutationHook({
  tags: [UPSERT_INVOICE_PAYMENT_TAG_KEY],
  request: updateDedicatedInvoicePayment,
  keyParamNames: ['invoiceId', 'invoicePaymentId'],
  schema: UpsertDedicatedInvoicePaymentReturnSchema,
  swrOptions: { throwOnError: true },
})

export const updateInvoiceWithPayment = (invoice: Invoice, invoicePayment: InvoicePayment) => {
  const outstandingBalance = invoice.outstandingBalance - invoicePayment.amount
  const status = outstandingBalance === 0 ? InvoiceStatus.Paid : InvoiceStatus.PartiallyPaid

  return { ...invoice, status, outstandingBalance }
}

type UseUpsertDedicatedInvoicePaymentProps =
  | { mode: UpsertDedicatedInvoicePaymentMode.Create, invoiceId: string }
  | { mode: UpsertDedicatedInvoicePaymentMode.Update, invoiceId: string, invoicePaymentId: string }

export const useUpsertDedicatedInvoicePayment = (props: UseUpsertDedicatedInvoicePaymentProps) => {
  const { mode, invoiceId } = props
  const invoicePaymentId = mode === UpsertDedicatedInvoicePaymentMode.Update ? props.invoicePaymentId : undefined

  const applyPaymentToInvoice = useCallback((invoicePayment: InvoicePayment) =>
    (invoice: Invoice) => {
      if (invoice.id !== invoiceId) return invoice
      return updateInvoiceWithPayment(invoice, invoicePayment)
    }, [invoiceId])

  const createResponse = useCreateDedicatedInvoicePayment({ invoiceId })
  const updateResponse = useUpdateDedicatedInvoicePayment({
    invoiceId,
    invoicePaymentId: invoicePaymentId ?? '',
    isEnabled: invoicePaymentId !== undefined,
  })

  const mutationResponse = mode === UpsertDedicatedInvoicePaymentMode.Create ? createResponse : updateResponse

  const { patchByTransformation: patchInvoiceWithTransformation } = useInvoicesGlobalCacheActions()
  const { forceReload: forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      void patchInvoiceWithTransformation(applyPaymentToInvoice(triggerResult))

      void forceReloadInvoiceSummaryStats()

      return triggerResult
    },
    [originalTrigger, patchInvoiceWithTransformation, applyPaymentToInvoice, forceReloadInvoiceSummaryStats],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
