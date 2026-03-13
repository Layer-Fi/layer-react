import { useCallback, useMemo, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import type { Invoice } from '@schemas/invoices/invoice'
import type { InvoicePaymentMethod } from '@schemas/invoices/invoicePaymentMethod'
import {
  FinalizeInvoiceBodySchema,
  useFinalizeInvoice,
} from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/finalize-invoice/useFinalizeInvoice'
import { useAppForm } from '@hooks/features/forms/useForm'
import {
  convertInvoiceFinalizeFormToParams,
  getInvoiceFinalizeFormDefaultValues,
  type InvoiceFinalizeFormValues,
  validateInvoiceFinalizeForm,
} from '@components/Invoices/InvoicePreview/InvoiceFinalizeForm/formUtils'

type UseInvoiceFinalizeFormProps = {
  invoice: Invoice
  initialPaymentMethods: readonly InvoicePaymentMethod[]
  onSuccess: (invoice: Invoice) => void
}

export const useInvoiceFinalizeForm = ({
  invoice,
  initialPaymentMethods,
  onSuccess,
}: UseInvoiceFinalizeFormProps) => {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { trigger: finalizeInvoice } = useFinalizeInvoice({ invoiceId: invoice.id })

  const defaultValues = useMemo(() => getInvoiceFinalizeFormDefaultValues({
    invoice,
    paymentMethods: initialPaymentMethods,
  }), [invoice, initialPaymentMethods])

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

  const validators = useMemo(() => ({
    onDynamic: (args: { value: InvoiceFinalizeFormValues }) => validateInvoiceFinalizeForm(args, t),
  }), [t])

  const form = useAppForm<InvoiceFinalizeFormValues>({
    defaultValues,
    onSubmit,
    validators,
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'submit',
    }),
    canSubmitWhenInvalid: true,
  })

  return useMemo(
    () => ({ form, submitError }),
    [form, submitError],
  )
}
