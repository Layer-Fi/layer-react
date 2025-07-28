import { EMPTY_LINE_ITEM, useInvoiceForm } from './useInvoiceForm'
import type { Invoice } from '../../../features/invoices/invoiceSchemas'
import { UpsertInvoiceMode } from '../../../features/invoices/api/useUpsertInvoice'
import { Form } from '../../ui/Form/Form'
import { HStack, VStack } from '../../ui/Stack/Stack'
import { Button } from '../../ui/Button/Button'
import { Plus, Trash } from 'lucide-react'
import { BigDecimal as BD } from 'effect'
import { CustomerSelector } from '../../../features/customers/components/CustomerSelector'
import { BIG_DECIMAL_ZERO, convertBigDecimalToCents, convertCentsToBigDecimal } from '../../../utils/bigDecimalUtils'

const INVOICE_FORM_CSS_PREFIX = 'Layer__InvoiceForm'
const INVOICE_FORM_FIELD_CSS_PREFIX = `${INVOICE_FORM_CSS_PREFIX}__Field`
export type InvoiceFormMode = { mode: UpsertInvoiceMode.Update, invoice: Invoice } | { mode: UpsertInvoiceMode.Create }
export type InvoiceFormProps = InvoiceFormMode & {
  onSuccess?: (invoice: Invoice) => void
}

export const InvoiceForm = (props: InvoiceFormProps) => {
  const { onSuccess, mode } = props
  const { form } = useInvoiceForm(
    { onSuccess, ...(mode === UpsertInvoiceMode.Update ? { mode, invoice: props.invoice } : { mode }) },
  )

  return (
    <Form className={INVOICE_FORM_CSS_PREFIX}>
      <VStack className={`${INVOICE_FORM_CSS_PREFIX}__Metadata`} gap='xs'>
        <form.Field
          name='customer'
          listeners={{
            onChange: ({ value: customer }) => {
              form.setFieldValue('email', customer?.email)
              form.setFieldValue('address', customer?.addressString)
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
      <VStack className={`${INVOICE_FORM_CSS_PREFIX}__LineItems`} gap='xs'>
        <form.AppField name='lineItems' mode='array'>
          {field => (
            <VStack gap='xs' align='baseline'>
              {field.state.value.map((_, index) => (
                <HStack key={`lineItems[${index}]`} gap='xs' align='end' className={`${INVOICE_FORM_CSS_PREFIX}__LineItem`}>
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
                        const unitPrice = form.getFieldValue(`lineItems[${index}].unitPrice`)
                        const nextAmount = BD.multiply(convertCentsToBigDecimal(unitPrice), quantity)

                        form.setFieldValue(`lineItems[${index}].amount`, convertBigDecimalToCents(nextAmount))
                      },
                    }}
                  >
                    {innerField => <innerField.FormBigDecimalField label='Quantity' showLabel={index === 0} />}
                  </form.AppField>
                  <form.AppField
                    name={`lineItems[${index}].unitPrice`}
                    listeners={{
                      onBlur: ({ value: unitPrice }) => {
                        const quantity = form.getFieldValue(`lineItems[${index}].quantity`)
                        const nextAmount = BD.multiply(convertCentsToBigDecimal(unitPrice), quantity)

                        form.setFieldValue(`lineItems[${index}].amount`, convertBigDecimalToCents(nextAmount))
                      },
                    }}
                  >
                    {innerField => <innerField.FormCurrencyField label='Rate' showLabel={index === 0} />}
                  </form.AppField>
                  <form.AppField
                    name={`lineItems[${index}].amount`}
                    listeners={{
                      onBlur: ({ value: amount }) => {
                        const quantity = form.getFieldValue(`lineItems[${index}].quantity`)

                        let nextUnitPrice = BIG_DECIMAL_ZERO
                        try {
                          nextUnitPrice = BD.unsafeDivide(convertCentsToBigDecimal(amount), quantity)
                        }
                        catch { /* empty */ }

                        form.setFieldValue(`lineItems[${index}].unitPrice`, convertBigDecimalToCents(nextUnitPrice))
                      },
                    }}
                  >
                    {innerField => <innerField.FormCurrencyField label='Amount' showLabel={index === 0} />}
                  </form.AppField>
                  <form.AppField name={`lineItems[${index}].isTaxable`}>
                    {innerField => <innerField.FormCheckboxField label='Tax' showLabel={index === 0} />}
                  </form.AppField>
                  <Button variant='outlined' icon aria-label='Delete line item' onClick={() => field.removeValue(index)}><Trash size={16} /></Button>
                </HStack>
              ))}
              <Button variant='outlined' onClick={() => field.pushValue(EMPTY_LINE_ITEM)}>
                Add line item
                <Plus size={16} />
              </Button>
            </VStack>
          )}
        </form.AppField>
      </VStack>
    </Form>
  )
}
