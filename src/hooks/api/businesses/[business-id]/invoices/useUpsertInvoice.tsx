import { useCallback } from 'react'
import { Schema } from 'effect'

import { InvoiceSchema, type UpsertInvoiceSchema } from '@schemas/invoices/invoice'
import { patch, post } from '@utils/api/authenticatedHttp'
import { withStableTrigger } from '@utils/swr/withStableTrigger'
import { useInvoiceSummaryStatsCacheActions } from '@hooks/api/businesses/[business-id]/invoices/summary-stats/useInvoiceSummaryStats'
import { useInvoicesGlobalCacheActions } from '@hooks/api/businesses/[business-id]/invoices/useListInvoices'
import { createMutationHook } from '@hooks/utils/swr/createMutationHook'

const UPSERT_INVOICE_TAG_KEY = '#upsert-invoice'

export enum UpsertInvoiceMode {
  Create = 'Create',
  Update = 'Update',
}

type UpsertInvoiceBody = typeof UpsertInvoiceSchema.Encoded

const UpsertInvoiceReturnSchema = Schema.Struct({
  data: InvoiceSchema,
})

type UpsertInvoiceReturnEncoded = typeof UpsertInvoiceReturnSchema.Encoded

const createInvoice = post<
  UpsertInvoiceReturnEncoded,
  UpsertInvoiceBody,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/invoices`)

const updateInvoice = patch<
  UpsertInvoiceReturnEncoded,
  UpsertInvoiceBody,
  { businessId: string, invoiceId: string }
>(({ businessId, invoiceId }) => `/v1/businesses/${businessId}/invoices/${invoiceId}`)

export type CreateParams = {
  readonly businessId: string
}

export type UpdateParams = {
  readonly businessId: string
  readonly invoiceId: string
}

export type UpsertParams = CreateParams | UpdateParams

const useCreateInvoice = createMutationHook({
  tags: [UPSERT_INVOICE_TAG_KEY],
  request: createInvoice,
  schema: UpsertInvoiceReturnSchema,
  swrOptions: { throwOnError: true },
})

const useUpdateInvoice = createMutationHook({
  tags: [UPSERT_INVOICE_TAG_KEY],
  request: updateInvoice,
  keyParams: ['invoiceId'],
  schema: UpsertInvoiceReturnSchema,
  swrOptions: { throwOnError: true },
})

type UseUpsertInvoiceProps =
  | { mode: UpsertInvoiceMode.Create }
  | { mode: UpsertInvoiceMode.Update, invoiceId: string }

export const useUpsertInvoice = (props: UseUpsertInvoiceProps) => {
  const { mode } = props
  const invoiceId = mode === UpsertInvoiceMode.Update ? props.invoiceId : undefined

  const createResponse = useCreateInvoice()
  const updateResponse = useUpdateInvoice({
    invoiceId: invoiceId ?? '',
    isEnabled: invoiceId !== undefined,
  })

  const mutationResponse = mode === UpsertInvoiceMode.Create ? createResponse : updateResponse

  const { patchByKey: patchInvoiceByKey, forceReload: forceReloadInvoices } = useInvoicesGlobalCacheActions()
  const { forceReload: forceReloadInvoiceSummaryStats } = useInvoiceSummaryStatsCacheActions()

  const originalTrigger = mutationResponse.trigger

  const stableProxiedTrigger = useCallback(
    async (...triggerParameters: Parameters<typeof originalTrigger>) => {
      const triggerResult = await originalTrigger(...triggerParameters)

      if (mode === UpsertInvoiceMode.Update) {
        void patchInvoiceByKey(triggerResult.data)
      }
      else {
        void forceReloadInvoices()
      }

      void forceReloadInvoiceSummaryStats()

      return triggerResult
    },
    [originalTrigger, mode, patchInvoiceByKey, forceReloadInvoices, forceReloadInvoiceSummaryStats],
  )

  return withStableTrigger(mutationResponse, stableProxiedTrigger)
}
