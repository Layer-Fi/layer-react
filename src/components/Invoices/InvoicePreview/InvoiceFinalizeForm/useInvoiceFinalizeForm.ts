import { useCallback, useMemo, useRef, useState } from 'react'
import { revalidateLogic, useStore } from '@tanstack/react-form'
import { Schema } from 'effect'

import {
  convertInvoiceFinalizeFormToParams,
  getInvoiceFinalizeFormDefaultValues,
  type InvoiceFinalizeFormValues,
} from '@components/Invoices/InvoicePreview/InvoiceFinalizeForm/formUtils'
import { useAppForm } from '@features/forms/hooks/useForm'
import {
  FinalizeInvoiceBodySchema,
  useFinalizeInvoice,
} from '@features/invoices/api/useFinalizeInvoice'
import type { InvoicePaymentMethod } from '@features/invoices/invoicePaymentMethodSchemas'
import type { Invoice } from '@features/invoices/invoiceSchemas'

type UseInvoiceFinalizeFormProps = {
  invoice: Invoice
  initialPaymentMethods: readonly InvoicePaymentMethod[]
  onSuccess: (invoice: Invoice) => void
}

export type InvoiceFinalizeFormState = {
  canSubmit: boolean
  isDirty: boolean
  isSubmitting: boolean
}

export const useInvoiceFinalizeForm = ({
  invoice,
  initialPaymentMethods,
  onSuccess,
}: UseInvoiceFinalizeFormProps) => {
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { trigger: finalizeInvoice } = useFinalizeInvoice({ invoiceId: invoice.id })

  const defaultValuesRef = useRef<InvoiceFinalizeFormValues>(
    getInvoiceFinalizeFormDefaultValues({
      invoice,
      paymentMethods: initialPaymentMethods,
    }),
  )
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(
    async ({ value }: { value: InvoiceFinalizeFormValues }) => {
      try {
        const finalizeInvoiceParams = convertInvoiceFinalizeFormToParams(value)
        const finalizeInvoiceRequest = Schema.encodeUnknownSync(
          FinalizeInvoiceBodySchema,
        )(finalizeInvoiceParams)

        const { data } = await finalizeInvoice(finalizeInvoiceRequest)
        setSubmitError(undefined)
        onSuccess(data.invoice)
      }
      catch (e) {
        console.error(e)
        setSubmitError('Something went wrong. Please try again.')
      }
    },
    [finalizeInvoice, onSuccess],
  )

  const form = useAppForm<InvoiceFinalizeFormValues>({
    defaultValues,
    onSubmit,
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'submit',
    }),
    canSubmitWhenInvalid: true,
  })

  const canSubmit = useStore(form.store, state => state.canSubmit)
  const isDirty = useStore(form.store, state => state.isDirty)
  const isSubmitting = useStore(form.store, state => state.isSubmitting)

  const formState = useMemo(
    () => ({
      canSubmit,
      isDirty,
      isSubmitting,
    }),
    [canSubmit, isDirty, isSubmitting],
  )

  return useMemo(
    () => ({ form, formState, submitError }),
    [form, formState, submitError],
  )
}
