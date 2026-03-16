import { useCallback, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import { CreateCustomerRefundSchema, type CustomerRefund } from '@schemas/invoices/customerRefund'
import { type Invoice } from '@schemas/invoices/invoice'
import { useRefundInvoice } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/refund/useRefundInvoice'
import { useAppForm } from '@hooks/features/forms/useForm'
import { convertInvoiceRefundFormToParams, getInvoiceRefundFormDefaultValues, validateInvoiceRefundForm } from '@components/Invoices/InvoiceRefundForm/formUtils'
import type { InvoiceRefundForm } from '@components/Invoices/InvoiceRefundForm/invoiceRefundFormSchemas'

type onSuccessFn = (refund: CustomerRefund) => void
type UseInvoiceRefundFormProps = { onSuccess: onSuccessFn, invoice: Invoice }

export const useInvoiceRefundForm = ({ onSuccess, invoice }: UseInvoiceRefundFormProps) => {
  const { t } = useTranslation()
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
      setSubmitError(t('somethingWentWrongPleaseTryAgain', 'Something went wrong. Please try again.'))
    }
  }, [onSuccess, refundInvoice, t])

  const onDynamic = useCallback(({ value }: { value: InvoiceRefundForm }) => {
    return validateInvoiceRefundForm({ invoiceRefund: value, invoice }, t)
  }, [invoice, t])

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
