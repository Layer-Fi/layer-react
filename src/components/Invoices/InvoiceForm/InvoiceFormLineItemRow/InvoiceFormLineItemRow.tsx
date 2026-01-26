import classNames from 'classnames'
import { BigDecimal as BD } from 'effect'
import { Trash } from 'lucide-react'
import type { PropsWithChildren } from 'react'

import { CategoriesListMode, type Classification, isClassificationAccountIdentifier } from '@schemas/categorization'
import { safeDivide } from '@utils/bigDecimalUtils'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { getAdditionalTags, getSelectedTag, INVOICE_MECE_TAG_DIMENSION } from '@components/Invoices/InvoiceForm/formUtils'
import type { InvoiceFormType } from '@components/Invoices/InvoiceForm/useInvoiceForm'
import { LedgerAccountCombobox } from '@components/LedgerAccountCombobox/LedgerAccountCombobox'
import { withForceUpdate } from '@features/forms/components/FormBigDecimalField'
import { TagDimensionCombobox } from '@features/tags/components/TagDimensionCombobox'
import { type Tag } from '@features/tags/tagSchemas'

import './invoiceFormLineItemRow.scss'

type InvoiceFormLineItemRowProps = PropsWithChildren<{
  form: InvoiceFormType
  index: number
  isReadOnly: boolean
  onDeleteLine: () => void
}>

export const InvoiceFormLineItemRow = ({ form, index, isReadOnly, onDeleteLine }: InvoiceFormLineItemRowProps) => {
  return (
    <VStack gap='xs'>
      <HStack
        gap='xs'
        align='end'
        className={classNames('Layer__InvoiceForm__LineItem', isReadOnly && 'Layer__InvoiceForm__LineItem--readonly')}
      >
        <form.Field name={`lineItems[${index}].accountIdentifier`}>
          {(field) => {
            const onValueChange = (value: Classification | null) => {
              if (value && !isClassificationAccountIdentifier(value)) {
                return
              }
              field.setValue(value)
            }

            return (
              <LedgerAccountCombobox
                label='Revenue account (hidden)'
                value={field.state.value}
                mode={CategoriesListMode.Revenue}
                onValueChange={onValueChange}
                isReadOnly={isReadOnly}
                showLabel={index === 0}
              />
            )
          }}
        </form.Field>
        <form.Field name={`lineItems[${index}].tags`}>
          {(field) => {
            const additionalTags = getAdditionalTags(field.state.value)
            const selectedTag = getSelectedTag(field.state.value)

            const onValueChange = (value: Tag | null) => {
              field.setValue(value ? [...additionalTags, value] : additionalTags)
            }

            return (
              <TagDimensionCombobox
                dimensionKey={INVOICE_MECE_TAG_DIMENSION}
                isReadOnly={isReadOnly}
                value={selectedTag}
                onValueChange={onValueChange}
                showLabel={index === 0}
                isClearable={false}
              />
            )
          }}
        </form.Field>
        <form.AppField name={`lineItems[${index}].description`}>
          {field => <field.FormTextField label='Description' showLabel={index === 0} isReadOnly={isReadOnly} />}
        </form.AppField>
        <form.AppField
          name={`lineItems[${index}].quantity`}
          listeners={{
            onBlur: ({ value: quantity }) => {
              const amount = form.getFieldValue(`lineItems[${index}].amount`)
              const unitPrice = form.getFieldValue(`lineItems[${index}].unitPrice`)
              const nextAmount = BD.round(BD.normalize(BD.multiply(unitPrice, quantity)), { scale: 2 })

              if (!BD.equals(amount, nextAmount)) {
                form.setFieldValue(`lineItems[${index}].amount`, withForceUpdate(nextAmount))
              }
            },
          }}
        >
          {field => <field.FormBigDecimalField label='Quantity' showLabel={index === 0} isReadOnly={isReadOnly} />}
        </form.AppField>
        <form.AppField
          name={`lineItems[${index}].unitPrice`}
          listeners={{
            onBlur: ({ value: unitPrice }) => {
              const amount = form.getFieldValue(`lineItems[${index}].amount`)
              const quantity = form.getFieldValue(`lineItems[${index}].quantity`)
              const nextAmount = BD.round(BD.normalize(BD.multiply(unitPrice, quantity)), { scale: 2 })

              if (!BD.equals(amount, nextAmount)) {
                form.setFieldValue(`lineItems[${index}].amount`, withForceUpdate(nextAmount))
              }
            },
          }}
        >
          {field => <field.FormBigDecimalField label='Rate' mode='currency' showLabel={index === 0} allowNegative isReadOnly={isReadOnly} />}
        </form.AppField>
        <form.AppField
          name={`lineItems[${index}].amount`}
          listeners={{
            onBlur: ({ value: amount }) => {
              const unitPrice = form.getFieldValue(`lineItems[${index}].unitPrice`)
              const quantity = form.getFieldValue(`lineItems[${index}].quantity`)
              const nextUnitPrice = BD.round(BD.normalize(safeDivide(amount, quantity)), { scale: 2 })

              if (!BD.equals(unitPrice, nextUnitPrice)) {
                form.setFieldValue(`lineItems[${index}].unitPrice`, withForceUpdate(nextUnitPrice))
              }
            },
          }}
        >
          {field => <field.FormBigDecimalField label='Amount' mode='currency' showLabel={index === 0} allowNegative isReadOnly={isReadOnly} />}
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
