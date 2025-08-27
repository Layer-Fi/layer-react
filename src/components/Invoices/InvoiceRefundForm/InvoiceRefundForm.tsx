import React, { forwardRef, useCallback, useImperativeHandle } from 'react'
import type { Invoice } from '../../../features/invoices/invoiceSchemas'
import { Form } from '../../ui/Form/Form'
import { HStack, VStack } from '../../ui/Stack/Stack'
import { DataState, DataStateStatus } from '../../DataState'
import { AlertTriangle } from 'lucide-react'
import { TextSize } from '../../Typography'
import { useInvoiceRefundForm } from './useInvoiceRefundForm'
import { PaymentMethodComboBox } from '../../PaymentMethod/PaymentMethodComboBox'
import { Span } from '../../ui/Typography/Text'
import { flattenValidationErrors } from '../../../utils/form'
import type { CustomerRefund } from '../../../features/invoices/customerRefundSchemas'

const INVOICE_REFUND_FORM_CSS_PREFIX = 'Layer__InvoiceRefundForm'
const INVOICE_REFUND_FORM_FIELD_CSS_PREFIX = `${INVOICE_REFUND_FORM_CSS_PREFIX}__Field`

export type InvoiceRefundFormProps = {
  onSuccess: (refund: CustomerRefund) => void
  invoice: Invoice
}

export const InvoiceRefundForm = forwardRef(({ onSuccess, invoice }: InvoiceRefundFormProps, ref) => {
  const { form, submitError } = useInvoiceRefundForm({ onSuccess, invoice })

  // Prevents default browser form submission behavior since we're handling submission externally
  // via a custom handler (e.g., onClick). This ensures accidental native submits (like pressing
  // Enter or using a <button type="submit">) don’t trigger unexpected behavior.
  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  useImperativeHandle(ref, () => ({
    submit: () => form.handleSubmit(),
  }))

  return (
    <Form className={INVOICE_REFUND_FORM_CSS_PREFIX} onSubmit={blockNativeOnSubmit}>
      <form.Subscribe selector={state => state.errorMap}>
        {(errorMap) => {
          const validationErrors = flattenValidationErrors(errorMap)
          if (validationErrors.length > 0 || submitError) {
            return (
              <HStack className={`${INVOICE_REFUND_FORM_CSS_PREFIX}__FormError`}>
                <DataState
                  icon={<AlertTriangle size={16} />}
                  status={DataStateStatus.failed}
                  title={validationErrors[0] || submitError}
                  titleSize={TextSize.md}
                  inline
                />
              </HStack>
            )
          }
        }}
      </form.Subscribe>
      <VStack className={`${INVOICE_REFUND_FORM_CSS_PREFIX}__Section`} gap='sm'>
        <HStack className={`${INVOICE_REFUND_FORM_FIELD_CSS_PREFIX}__InvoiceNo`} gap='xs' align='center'>
          <Span size='sm'>Invoice</Span>
          <Span size='md' weight='bold'>
            #
            {invoice.invoiceNumber}
          </Span>
        </HStack>
        <form.AppField name='completedAt'>
          {field => <field.FormDateField label='Refund date' inline className={`${INVOICE_REFUND_FORM_FIELD_CSS_PREFIX}__CompletedAt`} />}
        </form.AppField>
        <form.Field name='method'>
          {field => (
            <PaymentMethodComboBox
              className={`${INVOICE_REFUND_FORM_FIELD_CSS_PREFIX}__PaymentMethod`}
              value={field.state.value}
              onValueChange={field.handleChange}
              inline
            />
          )}
        </form.Field>
        <form.AppField name='amount'>
          {field => <field.FormBigDecimalField label='Amount' inline className={`${INVOICE_REFUND_FORM_FIELD_CSS_PREFIX}__Amount`} mode='currency' isReadOnly />}
        </form.AppField>
      </VStack>
    </Form>
  )
})
InvoiceRefundForm.displayName = 'InvoiceRefundForm'
