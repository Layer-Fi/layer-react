import { useState } from 'react'
import { useForm, FormValidateOrFn, FormAsyncValidateOrFn, useStore } from '@tanstack/react-form'
import type { UpsertInvoice, Invoice } from '../../../features/invoices/invoiceSchemas'
import { useUpsertInvoice, UpsertInvoiceMode } from '../../../features/invoices/api/useUpsertInvoice'

type UseInvoiceFormProps =
  | { onSuccess?: (invoice: Invoice) => void, mode: UpsertInvoiceMode.Create }
  | { onSuccess?: (invoice: Invoice) => void, mode: UpsertInvoiceMode.Update, invoice: Invoice }

// TODO: Add good default form values
export const useInvoiceForm = (props: UseInvoiceFormProps) => {
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, mode } = props

  const upsertInvoiceProps = mode === UpsertInvoiceMode.Update ? { mode, invoiceId: props.invoice.id } : { mode }
  const { trigger: upsertInvoice } = useUpsertInvoice(upsertInvoiceProps)

  const form = useForm<
    UpsertInvoice,
    FormValidateOrFn<UpsertInvoice>,
    FormValidateOrFn<UpsertInvoice>,
    FormValidateOrFn<UpsertInvoice>,
    FormValidateOrFn<UpsertInvoice>,
    FormAsyncValidateOrFn<UpsertInvoice>,
    FormValidateOrFn<UpsertInvoice>,
    FormAsyncValidateOrFn<UpsertInvoice>,
    FormAsyncValidateOrFn<UpsertInvoice>,
    FormAsyncValidateOrFn<UpsertInvoice>
  >({
    onSubmit: async ({ value }) => {
      try {
        const { data: invoice } = await upsertInvoice(value)
        setSubmitError(undefined)
        onSuccess?.(invoice)
      }
      catch {
        setSubmitError('Something went wrong. Please try again.')
      }
    },
  })

  const isFormValid = useStore(form.store, state => state.isValid)

  return { form, submitError, isFormValid }
}
