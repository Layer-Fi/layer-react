import { useCallback } from 'react'
import { BigDecimal as BD } from 'effect'
import { AlertTriangle } from 'lucide-react'
import type React from 'react'
import { Trans, useTranslation } from 'react-i18next'

import type { Invoice } from '@schemas/invoices/invoice'
import type { InvoicePayment } from '@schemas/invoices/invoicePayment'
import { convertCentsToBigDecimal, formatBigDecimalToString } from '@utils/bigDecimalUtils'
import { flattenValidationErrors } from '@utils/form'
import type { UpsertDedicatedInvoicePaymentMode } from '@hooks/api/businesses/[business-id]/invoices/[invoice-id]/payment/useUpsertDedicatedInvoicePayment'
import { Button } from '@ui/Button/Button'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { Span } from '@ui/Typography/Text'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { useInvoicePaymentForm } from '@components/Invoices/InvoicePaymentForm/useInvoicePaymentForm'
import { PaymentMethodComboBox } from '@components/PaymentMethod/PaymentMethodComboBox'
import { TextSize } from '@components/Typography/Text'

import './invoicePaymentForm.scss'

const INVOICE_PAYMENT_FORM_CSS_PREFIX = 'Layer__InvoicePaymentForm'
const INVOICE_PAYMENT_FORM_FIELD_CSS_PREFIX = `${INVOICE_PAYMENT_FORM_CSS_PREFIX}__Field`

export type InvoicePaymentFormMode =
  | { mode: UpsertDedicatedInvoicePaymentMode.Update, invoice: Invoice, invoicePayment: InvoicePayment }
  | { mode: UpsertDedicatedInvoicePaymentMode.Create, invoice: Invoice }

export type InvoicePaymentFormProps = InvoicePaymentFormMode & {
  isReadOnly?: boolean
  onSuccess: (invoicePayment: InvoicePayment) => void
}

export const InvoicePaymentForm = (props: InvoicePaymentFormProps) => {
  const { t } = useTranslation()
  const { onSuccess, invoice, isReadOnly } = props
  const { form, submitError } = useInvoicePaymentForm(
    { onSuccess, invoice },
  )

  // Prevents default browser form submission behavior since we're handling submission externally
  // via a custom handler (e.g., onClick). This ensures accidental native submits (like pressing
  // Enter or using a <button type="submit">) don’t trigger unexpected behavior.
  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <Form className={INVOICE_PAYMENT_FORM_CSS_PREFIX} onSubmit={blockNativeOnSubmit}>
      <form.Subscribe selector={state => state.errorMap}>
        {(errorMap) => {
          const validationErrors = flattenValidationErrors(errorMap)
          if (validationErrors.length > 0 || submitError) {
            return (
              <HStack className={`${INVOICE_PAYMENT_FORM_CSS_PREFIX}__FormError`}>
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
      <VStack className={`${INVOICE_PAYMENT_FORM_CSS_PREFIX}__Section`} gap='sm'>
        <HStack className={`${INVOICE_PAYMENT_FORM_FIELD_CSS_PREFIX}__InvoiceNo`} gap='xs' align='center'>
          <Trans
            i18nKey='invoices:label.invoice_number_component'
            defaults='<label>Invoice</label> <value>#{{invoiceNumber}}</value>'
            values={{ invoiceNumber: invoice.invoiceNumber }}
            components={{
              label: <Span size='sm' />,
              value: <Span size='md' weight='bold' ellipsis />,
            }}
          />
        </HStack>
        <form.AppField name='paidAt'>
          {field => <field.FormDateField label={t('invoices:label.payment_date', 'Payment date')} inline className={`${INVOICE_PAYMENT_FORM_FIELD_CSS_PREFIX}__PaidAt`} isReadOnly={isReadOnly} />}
        </form.AppField>
      </VStack>
      <VStack className={`${INVOICE_PAYMENT_FORM_CSS_PREFIX}__Section`} gap='xs'>
        <Heading level={3} size='sm' pbe='xs'>{t('invoices:label.payment_details', 'Payment details')}</Heading>
        <form.Field name='method'>
          {field => (
            <PaymentMethodComboBox
              className={`${INVOICE_PAYMENT_FORM_FIELD_CSS_PREFIX}__PaymentMethod`}
              value={field.state.value}
              onValueChange={field.handleChange}
              isReadOnly={isReadOnly}
              inline
            />
          )}
        </form.Field>
        <form.AppField name='referenceNumber'>
          {field =>
            <field.FormTextField label={t('common:label.reference_number', 'Reference number')} inline className={`${INVOICE_PAYMENT_FORM_FIELD_CSS_PREFIX}__ReferenceNo`} isReadOnly={isReadOnly} />}
        </form.AppField>
        <form.AppField name='memo'>
          {field => (
            <field.FormTextAreaField label={t('common:label.memo', 'Memo')} inline className={`${INVOICE_PAYMENT_FORM_FIELD_CSS_PREFIX}__Memo`} isReadOnly={isReadOnly} />
          )}
        </form.AppField>
      </VStack>
      <VStack className={`${INVOICE_PAYMENT_FORM_CSS_PREFIX}__Section`} gap='sm'>
        <form.AppField name='amount'>
          {field => <field.FormBigDecimalField label={t('invoices:label.amount_paid', 'Amount paid')} inline className={`${INVOICE_PAYMENT_FORM_FIELD_CSS_PREFIX}__Amount`} mode='currency' isReadOnly={isReadOnly} maxValue={convertCentsToBigDecimal(invoice.outstandingBalance)} />}
        </form.AppField>
        <form.Subscribe selector={state => [state.values.amount]}>
          {([amount]) => (
            <HStack justify='end' className={`${INVOICE_PAYMENT_FORM_FIELD_CSS_PREFIX}__OutstandingBalance`} gap='xs' align='center'>
              <Span size='sm'>{t('invoices:label.balance_due', 'Balance due')}</Span>
              <Span size='md' weight='bold'>
                {formatBigDecimalToString(BD.subtract(convertCentsToBigDecimal(invoice.outstandingBalance), amount), { mode: 'currency' })}
              </Span>
            </HStack>
          )}
        </form.Subscribe>
      </VStack>
      <VStack justify='end' className={`${INVOICE_PAYMENT_FORM_CSS_PREFIX}__Section ${INVOICE_PAYMENT_FORM_CSS_PREFIX}__Submit`}>
        <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button type='submit' isDisabled={!canSubmit} isPending={isSubmitting} onPress={() => { void form.handleSubmit() }}>
              {t('invoices:action.record_payment', 'Record Payment')}
            </Button>
          )}
        </form.Subscribe>
      </VStack>
    </Form>
  )
}
