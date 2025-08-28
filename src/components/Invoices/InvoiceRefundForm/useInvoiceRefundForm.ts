import { useCallback, useMemo, useState, useRef } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { useAppForm } from '../../../features/forms/hooks/useForm'
import { type Invoice } from '../../../features/invoices/invoiceSchemas'
import { Schema } from 'effect'
import { convertInvoiceRefundFormToParams, getInvoiceRefundFormDefaultValues, validateInvoiceRefundForm } from './formUtils'
import type { InvoiceRefundForm } from './invoiceRefundFormSchemas'
import { CreateCustomerRefundSchema, type CustomerRefund } from '../../../features/invoices/customerRefundSchemas'
import { useRefundInvoice } from '../../../features/invoices/api/useRefundInvoice'

type onSuccessFn = (refund: CustomerRefund) => void
type UseInvoiceRefundFormProps = { onSuccess: onSuccessFn, invoice: Invoice }

export const useInvoiceRefundForm = ({ onSuccess, invoice }: UseInvoiceRefundFormProps) => {
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
      setSubmitError('Something went wrong. Please try again.')
    }
  }, [onSuccess, refundInvoice])

  const onDynamic = useCallback(({ value }: { value: InvoiceRefundForm }) => {
    return validateInvoiceRefundForm({ invoiceRefund: value, invoice })
  }, [invoice])

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
