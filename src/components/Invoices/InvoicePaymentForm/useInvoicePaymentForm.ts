import { useCallback, useMemo, useState, useRef } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { useAppForm } from '@features/forms/hooks/useForm'
import { type Invoice } from '@features/invoices/invoiceSchemas'
import { type InvoicePayment, type DedicatedInvoicePaymentForm, UpsertDedicatedInvoicePaymentSchema } from '@features/invoices/invoicePaymentSchemas'
import { useUpsertDedicatedInvoicePayment, UpsertDedicatedInvoicePaymentMode } from '@features/invoices/api/useUpsertDedicatedInvoicePayment'
import { Schema } from 'effect'
import { convertInvoicePaymentFormToParams, getInvoicePaymentFormDefaultValues, validateInvoicePaymentForm } from '@components/Invoices/InvoicePaymentForm/formUtils'

type onSuccessFn = (invoicePayment: InvoicePayment) => void
type UseInvoicePaymentFormProps = { onSuccess: onSuccessFn, invoice: Invoice }

export const useInvoicePaymentForm = (props: UseInvoicePaymentFormProps) => {
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
    return validateInvoicePaymentForm({ invoicePayment: value, invoice })
  }, [invoice])

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
