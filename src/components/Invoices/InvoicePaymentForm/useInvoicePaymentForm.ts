import { useCallback, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import { type Invoice } from '@schemas/invoices/invoice'
import { type DedicatedInvoicePaymentForm, type InvoicePayment, UpsertDedicatedInvoicePaymentSchema } from '@schemas/invoices/invoicePayment'
import { UpsertDedicatedInvoicePaymentMode, useUpsertDedicatedInvoicePayment } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/payment/useUpsertDedicatedInvoicePayment'
import { useAppForm } from '@hooks/features/forms/useForm'
import { convertInvoicePaymentFormToParams, getInvoicePaymentFormDefaultValues, validateInvoicePaymentForm } from '@components/Invoices/InvoicePaymentForm/formUtils'

type onSuccessFn = (invoicePayment: InvoicePayment) => void
type UseInvoicePaymentFormProps = { onSuccess: onSuccessFn, invoice: Invoice }

export const useInvoicePaymentForm = (props: UseInvoicePaymentFormProps) => {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, invoice } = props

  const upsertDedicatedInvoicePaymentProps = { mode: UpsertDedicatedInvoicePaymentMode.Create as const, invoiceId: props.invoice.id }
  const { trigger: upsertDedicatedInvoicePayment } = useUpsertDedicatedInvoicePayment(upsertDedicatedInvoicePaymentProps)

  const defaultValuesRef = useRef<DedicatedInvoicePaymentForm>(getInvoicePaymentFormDefaultValues(invoice))
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: DedicatedInvoicePaymentForm }) => {
    try {
      const upsertDedicatedInvoicePaymentParams = convertInvoicePaymentFormToParams(value)
      const upsertDedicatedInvoicePaymentRequest = Schema.encodeUnknownSync(UpsertDedicatedInvoicePaymentSchema)(upsertDedicatedInvoicePaymentParams)

      const { data: invoicePayment } = await upsertDedicatedInvoicePayment(upsertDedicatedInvoicePaymentRequest)

      setSubmitError(undefined)
      onSuccess(invoicePayment)
    }
    catch (e) {
      console.error(e)
      setSubmitError('Something went wrong. Please try again.')
    }
  }, [onSuccess, upsertDedicatedInvoicePayment])

  const onDynamic = useCallback(({ value }: { value: DedicatedInvoicePaymentForm }) => {
    return validateInvoicePaymentForm({ invoicePayment: value, invoice }, t)
  }, [invoice, t])

  const validators = useMemo(() => ({ onDynamic }), [onDynamic])

  const form = useAppForm<DedicatedInvoicePaymentForm>({
    defaultValues,
    onSubmit,
    validators,
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'submit',
    }),
    canSubmitWhenInvalid: true,
  })

  return useMemo(() => (
    { form, submitError }),
  [form, submitError])
}
