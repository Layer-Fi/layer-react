import { useCallback, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import { CreateCustomerRefundSchema, type CustomerRefund } from '@schemas/invoices/customerRefund'
import { type Invoice } from '@schemas/invoices/invoice'
import { DateFormat } from '@utils/i18n/date/patterns'
import { useRefundInvoice } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/refund/useRefundInvoice'
import { useAppForm } from '@hooks/features/forms/useForm'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import {
  convertInvoiceRefundFormToParams,
  getInvoiceRefundFormDefaultValues,
  InvoiceRefundInvalidReason,
  validateInvoiceRefundForm,
} from '@components/Invoices/InvoiceRefundForm/formUtils'
import type { InvoiceRefundForm } from '@components/Invoices/InvoiceRefundForm/invoiceRefundFormSchemas'

type onSuccessFn = (refund: CustomerRefund) => void
type UseInvoiceRefundFormProps = { onSuccess: onSuccessFn, invoice: Invoice }

export const useInvoiceRefundForm = ({ onSuccess, invoice }: UseInvoiceRefundFormProps) => {
  const { t } = useTranslation()
  const { formatDate } = useIntlFormatter()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)

  const { trigger: refundInvoice } = useRefundInvoice({ invoiceId: invoice.id })

  const defaultValuesRef = useRef<InvoiceRefundForm>(getInvoiceRefundFormDefaultValues(invoice))
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: InvoiceRefundForm }) => {
    try {
      const customerRefundParams = convertInvoiceRefundFormToParams(value)
      const refundInvoiceRequest = Schema.encodeUnknownSync(CreateCustomerRefundSchema)(customerRefundParams)

      const { data: refund } = await refundInvoice(refundInvoiceRequest)

      setSubmitError(undefined)
      onSuccess(refund)
    }
    catch (e) {
      console.error(e)
      setSubmitError(t('common:error.something_went_wrong_please_try_again', 'Something went wrong. Please try again.'))
    }
  }, [onSuccess, refundInvoice, t])

  const getErrorText = useCallback((reason: InvoiceRefundInvalidReason): string => {
    switch (reason) {
      case InvoiceRefundInvalidReason.CompletedAtRequired:
        return t('invoices:validation.refund_date_required', 'Refund date is a required field.')
      case InvoiceRefundInvalidReason.CompletedAtBeforeLastPayment:
        return t('invoices:validation.refund_date_before_last_payment', 'Refund date cannot be before the last invoice payment ({{lastPaymentDate}}).', {
          lastPaymentDate: invoice.paidAt ? formatDate(invoice.paidAt, DateFormat.DateNumeric) : '',
        })
      case InvoiceRefundInvalidReason.CompletedAtInFuture:
        return t('invoices:validation.refund_date_future', 'Refund date cannot be in the future.')
      case InvoiceRefundInvalidReason.MethodRequired:
        return t('invoices:validation.payment_method_required', 'Payment method is a required field.')
      default:
        return ''
    }
  }, [formatDate, t, invoice.paidAt])

  const onDynamic = useCallback(({ value }: { value: InvoiceRefundForm }) => {
    const errors = validateInvoiceRefundForm({ invoiceRefund: value, invoice })
    if (!errors) return null

    return errors.map(({ field, reason }) => ({ [field]: getErrorText(reason) }))
  }, [getErrorText, invoice])

  const validators = useMemo(() => ({ onDynamic }), [onDynamic])

  const form = useAppForm<InvoiceRefundForm>({
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
