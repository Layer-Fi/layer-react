import { useCallback, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import { type Invoice } from '@schemas/invoices/invoice'
import { type DedicatedInvoicePaymentForm, type InvoicePayment, UpsertDedicatedInvoicePaymentSchema } from '@schemas/invoices/invoicePayment'
import { DateFormat } from '@utils/i18n/date/patterns'
import { UpsertDedicatedInvoicePaymentMode, useUpsertDedicatedInvoicePayment } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/payment/useUpsertDedicatedInvoicePayment'
import { useAppForm } from '@hooks/features/forms/useForm'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import {
  convertInvoicePaymentFormToParams,
  getInvoicePaymentFormDefaultValues,
  InvoicePaymentInvalidReason,
  validateInvoicePaymentForm,
} from '@components/Invoices/InvoicePaymentForm/formUtils'

type onSuccessFn = (invoicePayment: InvoicePayment) => void
type UseInvoicePaymentFormProps = { onSuccess: onSuccessFn, invoice: Invoice }

export const useInvoicePaymentForm = (props: UseInvoicePaymentFormProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
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
      setSubmitError(t('common:error.something_went_wrong_please_try_again', 'Something went wrong. Please try again.'))
    }
  }, [onSuccess, upsertDedicatedInvoicePayment, t])

  const getErrorText = useCallback((reason: InvoicePaymentInvalidReason): string => {
    switch (reason) {
      case InvoicePaymentInvalidReason.AmountMustBePositive:
        return t('invoices:validation.payment_amount_must', 'Payment amount must be greater than zero.')
      case InvoicePaymentInvalidReason.AmountExceedsOutstandingBalance:
        return t('invoices:validation.payment_amount_max_outstanding', 'Payment amount cannot be greater than the outstanding invoice balance.')
      case InvoicePaymentInvalidReason.PaidAtRequired:
        return t('invoices:validation.payment_date_required', 'Payment date is a required field.')
      case InvoicePaymentInvalidReason.PaidAtBeforeInvoiceDate:
        return t('invoices:validation.payment_date_not_before_invoice', 'Payment date cannot be before the invoice date ({{invoiceDate}}).', {
          invoiceDate: invoice.sentAt ? formatDate(invoice.sentAt, DateFormat.DateNumeric) : '',
        })
      case InvoicePaymentInvalidReason.PaidAtInFuture:
        return t('invoices:validation.payment_date_not_future', 'Payment date cannot be in the future.')
      case InvoicePaymentInvalidReason.MethodRequired:
        return t('invoices:validation.payment_method_required', 'Payment method is a required field.')
      default:
        return ''
    }
  }, [formatDate, invoice.sentAt, t])

  const onDynamic = useCallback(({ value }: { value: DedicatedInvoicePaymentForm }) => {
    const errors = validateInvoicePaymentForm({ invoicePayment: value, invoice })
    if (!errors) return null

    return errors.map(({ field, reason }) => ({ [field]: getErrorText(reason) }))
  }, [getErrorText, invoice])

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
