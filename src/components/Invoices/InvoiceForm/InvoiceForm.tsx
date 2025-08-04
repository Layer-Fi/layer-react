import { useCallback, useRef, type PropsWithChildren } from 'react'
import classNames from 'classnames'
import { getEmptyLineItem, useInvoiceForm } from './useInvoiceForm'
import type { Invoice } from '../../../features/invoices/invoiceSchemas'
import { UpsertInvoiceMode } from '../../../features/invoices/api/useUpsertInvoice'
import { Form } from '../../ui/Form/Form'
import { HStack, VStack } from '../../ui/Stack/Stack'
import { Button } from '../../ui/Button/Button'
import { Plus, Trash } from 'lucide-react'
import { BigDecimal as BD } from 'effect'
import { CustomerSelector } from '../../../features/customers/components/CustomerSelector'
import { convertBigDecimalToCents, safeDivide, negate } from '../../../utils/bigDecimalUtils'
import { Span } from '../../ui/Typography/Text'
import { convertCentsToCurrency } from '../../../utils/format'
import { getDurationInDaysFromTerms, InvoiceTermsComboBox, InvoiceTermsValues } from '../InvoiceTermsComboBox/InvoiceTermsComboBox'
import { type ZonedDateTime } from '@internationalized/date'
import { withForceUpdate } from '../../../features/forms/components/FormBigDecimalField'

const INVOICE_FORM_CSS_PREFIX = 'Layer__InvoiceForm'
const INVOICE_FORM_FIELD_CSS_PREFIX = `${INVOICE_FORM_CSS_PREFIX}__Field`

type InvoiceFormTotalRowProps = PropsWithChildren<{
  label: string
  value: BD.BigDecimal
}>

const getDueAtChanged = (dueAt: ZonedDateTime | null, previousDueAt: ZonedDateTime | null) =>
  (dueAt === null && previousDueAt !== null)
  || (dueAt !== null && previousDueAt === null)
  || (dueAt !== null && previousDueAt !== null && dueAt.compare(previousDueAt) !== 0)

const InvoiceFormTotalRow = ({ label, value, children }: InvoiceFormTotalRowProps) => {
  const className = classNames(
    `${INVOICE_FORM_CSS_PREFIX}__TotalRow`,
    children && `${INVOICE_FORM_CSS_PREFIX}__TotalRow--withField`,
  )

  return (
    <HStack className={className} align='center' gap='md'>
      <Span>{label}</Span>
      {children}
      <Span align='right'>
        {convertCentsToCurrency(convertBigDecimalToCents(value))}
      </Span>
    </HStack>
  )
}

export type InvoiceFormMode = { mode: UpsertInvoiceMode.Update, invoice: Invoice } | { mode: UpsertInvoiceMode.Create }
export type InvoiceFormProps = InvoiceFormMode & {
  onSuccess?: (invoice: Invoice) => void
}

export const InvoiceForm = (props: InvoiceFormProps) => {
  const { onSuccess, mode } = props
  const { form, subtotal, additionalDiscount, taxableSubtotal, taxes, grandTotal } = useInvoiceForm(
    { onSuccess, ...(mode === UpsertInvoiceMode.Update ? { mode, invoice: props.invoice } : { mode }) },
  )
  const lastDueAtRef = useRef<ZonedDateTime | null>(form.getFieldValue('dueAt'))

  const updateDueAtFromTermsAndSentAt = useCallback((terms: InvoiceTermsValues, sentAt: ZonedDateTime | null) => {
    if (sentAt == null) return

    const duration = getDurationInDaysFromTerms(terms)
    if (!duration) return

    const newDueAt = sentAt.add({ days: duration })
    const dueAtChanged = getDueAtChanged(lastDueAtRef.current, newDueAt)

    if (dueAtChanged) {
      const newDueAt = sentAt.add({ days: duration })
      form.setFieldValue('dueAt', newDueAt)
      lastDueAtRef.current = newDueAt
    }
  }, [form])

  return (
    <Form className={INVOICE_FORM_CSS_PREFIX}>
      <HStack gap='xl' className={`${INVOICE_FORM_CSS_PREFIX}__Terms`}>
        <VStack gap='xs'>
          <form.Field
            name='customer'
            listeners={{
              onChange: ({ value: customer }) => {
                form.setFieldValue('email', customer?.email || '')
                form.setFieldValue('address', customer?.addressString || '')
              },
            }}
          >
            {field => (
              <CustomerSelector
                className={`${INVOICE_FORM_FIELD_CSS_PREFIX}__Customer`}
                selectedCustomer={field.state.value}
                onSelectedCustomerChange={field.handleChange}
                inline
              />
            )}
          </form.Field>
          <form.AppField name='email'>
            {field => <field.FormTextField label='Email' inline className={`${INVOICE_FORM_FIELD_CSS_PREFIX}__Email`} />}
          </form.AppField>
          <form.AppField name='address'>
            {field => <field.FormTextAreaField label='Billing address' inline className={`${INVOICE_FORM_FIELD_CSS_PREFIX}__Address`} />}
          </form.AppField>
        </VStack>
        <VStack gap='xs'>
          <form.AppField name='invoiceNumber'>
            {field => <field.FormTextField label='Invoice number' inline className={`${INVOICE_FORM_FIELD_CSS_PREFIX}__InvoiceNo`} />}
          </form.AppField>
          <form.Field
            name='terms'
            listeners={{
              onChange: ({ value: terms }) => {
                const sentAt = form.getFieldValue('sentAt')
                updateDueAtFromTermsAndSentAt(terms, sentAt)
              },
            }}
          >
            {field => (
              <InvoiceTermsComboBox
                value={field.state.value}
                onValueChange={(value: InvoiceTermsValues | null) => {
                  if (value !== null) {
                    field.handleChange(value)
                  }
                }}
              />
            )}
          </form.Field>
          <form.AppField
            name='sentAt'
            listeners={{
              onBlur: ({ value: sentAt }) => {
                const terms = form.getFieldValue('terms')
                updateDueAtFromTermsAndSentAt(terms, sentAt)
              },
            }}
          >
            {field => <field.FormDateField label='Invoice date' inline className={`${INVOICE_FORM_FIELD_CSS_PREFIX}__SentAt`} />}
          </form.AppField>
          <form.AppField
            name='dueAt'
            listeners={{
              onBlur: ({ value: dueAt }) => {
                const terms = form.getFieldValue('terms')
                const previousDueAt = lastDueAtRef.current

                const dueAtChanged = getDueAtChanged(dueAt, previousDueAt)

                if (terms !== InvoiceTermsValues.Custom && dueAtChanged) {
                  form.setFieldValue('terms', InvoiceTermsValues.Custom)
                  lastDueAtRef.current = dueAt
                }
              },
            }}
          >
            {field => <field.FormDateField label='Due date' inline className={`${INVOICE_FORM_FIELD_CSS_PREFIX}__DueAt`} />}
          </form.AppField>
        </VStack>
      </HStack>
      <VStack className={`${INVOICE_FORM_CSS_PREFIX}__LineItems`} gap='md'>
        <form.Field name='lineItems' mode='array'>
          {field => (
            <VStack gap='xs' align='baseline'>
              {field.state.value.map((_value, index) => (
                /**
                 * A more correct implementation would use a UUID as the key for this HStack. Specifically, it is an antipattern in
                 * React to use array indices as keys. However, there are some ongoing issues with @tanstack/react-form related to
                 * deleting an element from an array field. In particular, the form values for the remaining array items may become
                 * momentarily undefined as they re-render due to re-indexing. Thus, we use indices here for now.
                 * See here for more information: https://github.com/TanStack/form/issues/1518.
                 */
                <HStack key={index} gap='xs' align='end' className={`${INVOICE_FORM_CSS_PREFIX}__LineItem`}>
                  <form.AppField name={`lineItems[${index}].product`}>
                    {innerField => <innerField.FormTextField label='Product' showLabel={index === 0} />}
                  </form.AppField>
                  <form.AppField name={`lineItems[${index}].description`}>
                    {innerField => <innerField.FormTextField label='Description' showLabel={index === 0} />}
                  </form.AppField>
                  <form.AppField
                    name={`lineItems[${index}].quantity`}
                    listeners={{
                      onBlur: ({ value: quantity }) => {
                        const amount = form.getFieldValue(`lineItems[${index}].amount`)
                        const unitPrice = form.getFieldValue(`lineItems[${index}].unitPrice`)
                        const nextAmount = BD.multiply(unitPrice, quantity)

                        if (!BD.equals(amount, nextAmount)) {
                          form.setFieldValue(`lineItems[${index}].amount`, withForceUpdate(amount))
                        }
                      },
                    }}
                  >
                    {innerField => <innerField.FormBigDecimalField label='Quantity' showLabel={index === 0} />}
                  </form.AppField>
                  <form.AppField
                    name={`lineItems[${index}].unitPrice`}
                    listeners={{
                      onBlur: ({ value: unitPrice }) => {
                        const amount = form.getFieldValue(`lineItems[${index}].amount`)
                        const quantity = form.getFieldValue(`lineItems[${index}].quantity`)
                        const nextAmount = BD.multiply(unitPrice, quantity)

                        if (!BD.equals(amount, nextAmount)) {
                          form.setFieldValue(`lineItems[${index}].amount`, withForceUpdate(amount))
                        }
                      },
                    }}
                  >
                    {innerField => <innerField.FormBigDecimalField label='Rate' mode='currency' showLabel={index === 0} allowNegative />}
                  </form.AppField>
                  <form.AppField
                    name={`lineItems[${index}].amount`}
                    listeners={{
                      onBlur: ({ value: amount }) => {
                        const unitPrice = form.getFieldValue(`lineItems[${index}].unitPrice`)
                        const quantity = form.getFieldValue(`lineItems[${index}].quantity`)
                        const nextUnitPrice = safeDivide(amount, quantity)

                        if (!BD.equals(unitPrice, nextUnitPrice)) {
                          form.setFieldValue(`lineItems[${index}].unitPrice`, withForceUpdate(nextUnitPrice))
                        }
                      },
                    }}
                  >
                    {innerField => <innerField.FormBigDecimalField label='Amount' mode='currency' showLabel={index === 0} allowNegative />}
                  </form.AppField>
                  <form.AppField name={`lineItems[${index}].isTaxable`}>
                    {innerField => <innerField.FormCheckboxField label='Tax' showLabel={index === 0} />}
                  </form.AppField>
                  <Button variant='outlined' icon aria-label='Delete line item' onClick={() => field.removeValue(index)}><Trash size={16} /></Button>
                </HStack>
              ))}
              <Button variant='outlined' onClick={() => field.pushValue(getEmptyLineItem())}>
                Add line item
                <Plus size={16} />
              </Button>
            </VStack>
          )}
        </form.Field>
        <VStack className={`${INVOICE_FORM_CSS_PREFIX}__Metadata`} pbs='md'>
          <HStack justify='space-between' gap='xl'>
            <VStack className={`${INVOICE_FORM_CSS_PREFIX}__AdditionalTextFields`}>
              <form.AppField name='memo'>
                {field => <field.FormTextAreaField label='Memo' />}
              </form.AppField>
            </VStack>
            <VStack className={`${INVOICE_FORM_CSS_PREFIX}__TotalFields`} fluid>
              <InvoiceFormTotalRow label='Subtotal' value={subtotal} />
              <InvoiceFormTotalRow label='Discount' value={negate(additionalDiscount)}>
                <form.AppField name='discountRate'>
                  {field => <field.FormBigDecimalField label='Discount' showLabel={false} mode='percent' />}
                </form.AppField>
              </InvoiceFormTotalRow>
              <InvoiceFormTotalRow label='Taxable subtotal' value={taxableSubtotal} />
              <InvoiceFormTotalRow label='Tax rate' value={taxes}>
                <form.AppField name='taxRate'>
                  {field => <field.FormBigDecimalField label='Tax Rate' showLabel={false} mode='percent' />}
                </form.AppField>
              </InvoiceFormTotalRow>
              <InvoiceFormTotalRow label='Total' value={grandTotal} />
            </VStack>
          </HStack>
        </VStack>
      </VStack>
    </Form>
  )
}
