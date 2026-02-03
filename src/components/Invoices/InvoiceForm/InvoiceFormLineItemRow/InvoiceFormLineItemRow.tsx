import classNames from 'classnames'
import { Trash } from 'lucide-react'

import { nrbdEquals } from '@schemas/nonRecursiveBigDecimal'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { computeLineItemAmount, computeLineItemUnitPrice } from '@components/Invoices/InvoiceForm/formUtils'
import type { InvoiceFormType } from '@components/Invoices/InvoiceForm/useInvoiceForm'

import './invoiceFormLineItemRow.scss'

type InvoiceFormLineItemRowProps = {
  form: InvoiceFormType
  index: number
  isReadOnly: boolean
  onDeleteLine: () => void
}

export const InvoiceFormLineItemRow = ({ form, index, isReadOnly, onDeleteLine }: InvoiceFormLineItemRowProps) => {
  return (
    <VStack>
      <HStack
        gap='xs'
        align='end'
        className={classNames('Layer__InvoiceForm__LineItem', isReadOnly && 'Layer__InvoiceForm__LineItem--readonly')}
      >
        <form.AppField name={`lineItems[${index}].description`}>
          {field => <field.FormTextField label='Description' showLabel={index === 0} isReadOnly={isReadOnly} />}
        </form.AppField>
        <form.AppField
          name={`lineItems[${index}].quantity`}
          listeners={{
            onBlur: ({ value: quantity }) => {
              const amount = form.getFieldValue(`lineItems[${index}].amount`)
              const unitPrice = form.getFieldValue(`lineItems[${index}].unitPrice`)
              const nextAmount = computeLineItemAmount(unitPrice, quantity)

              if (!nrbdEquals(amount, nextAmount)) {
                form.setFieldValue(`lineItems[${index}].amount`, nextAmount)
              }
            },
          }}
        >
          {field => <field.FormNonRecursiveBigDecimalField label='Quantity' showLabel={index === 0} isReadOnly={isReadOnly} />}
        </form.AppField>
        <form.AppField
          name={`lineItems[${index}].unitPrice`}
          listeners={{
            onBlur: ({ value: unitPrice }) => {
              const amount = form.getFieldValue(`lineItems[${index}].amount`)
              const quantity = form.getFieldValue(`lineItems[${index}].quantity`)
              const nextAmount = computeLineItemAmount(unitPrice, quantity)

              if (!nrbdEquals(amount, nextAmount)) {
                form.setFieldValue(`lineItems[${index}].amount`, nextAmount)
              }
            },
          }}
        >
          {field => <field.FormNonRecursiveBigDecimalField label='Rate' mode='currency' showLabel={index === 0} allowNegative isReadOnly={isReadOnly} />}
        </form.AppField>
        <form.AppField
          name={`lineItems[${index}].amount`}
          listeners={{
            onBlur: ({ value: amount }) => {
              const unitPrice = form.getFieldValue(`lineItems[${index}].unitPrice`)
              const quantity = form.getFieldValue(`lineItems[${index}].quantity`)
              const nextUnitPrice = computeLineItemUnitPrice(amount, quantity)

              if (!nrbdEquals(unitPrice, nextUnitPrice)) {
                form.setFieldValue(`lineItems[${index}].unitPrice`, nextUnitPrice)
              }
            },
          }}
        >
          {field => <field.FormNonRecursiveBigDecimalField label='Amount' mode='currency' showLabel={index === 0} allowNegative isReadOnly={isReadOnly} />}
        </form.AppField>
        <form.AppField name={`lineItems[${index}].isTaxable`}>
          {field => <field.FormCheckboxField label='Taxable' showLabel={index === 0} isReadOnly={isReadOnly} />}
        </form.AppField>
        {!isReadOnly
          && <Button variant='outlined' icon inset aria-label='Delete line item' onPress={onDeleteLine}><Trash size={16} /></Button>}
      </HStack>
    </VStack>
  )
}
