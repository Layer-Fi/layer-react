import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, type PropsWithChildren } from 'react'
import classNames from 'classnames'
import { useInvoiceForm, type InvoiceFormType } from './useInvoiceForm'
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
import { type ZonedDateTime, toCalendarDate, fromDate } from '@internationalized/date'
import { withForceUpdate } from '../../../features/forms/components/FormBigDecimalField'
import { type InvoiceFormState, EMPTY_LINE_ITEM, getAdditionalTags, getSelectedTag, INVOICE_MECE_TAG_DIMENSION } from './formUtils'
import { DataState, DataStateStatus } from '../../DataState'
import { AlertTriangle } from 'lucide-react'
import { TextSize } from '../../Typography'
import { useInvoiceDetail } from '../../../providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { flattenValidationErrors } from '../../../utils/form'
import { type Tag } from '../../../features/tags/tagSchemas'
import { LedgerAccountCombobox } from '../../LedgerAccountCombobox/LedgerAccountCombobox'
import { CategoriesListMode } from '../../../schemas/categorization'
import { TagDimensionCombobox } from '../../../features/tags/components/TagDimensionCombobox'
import './invoiceForm.scss'

const INVOICE_FORM_CSS_PREFIX = 'Layer__InvoiceForm'
const INVOICE_FORM_FIELD_CSS_PREFIX = `${INVOICE_FORM_CSS_PREFIX}__Field`

const getDueAtChanged = (dueAt: ZonedDateTime | null, previousDueAt: ZonedDateTime | null) =>
  (dueAt === null && previousDueAt !== null)
  || (dueAt !== null && previousDueAt === null)
  || (dueAt !== null && previousDueAt !== null && toCalendarDate(dueAt).compare(toCalendarDate(previousDueAt)) !== 0)

type InvoiceFormTotalRowProps = PropsWithChildren<{
  label: string
  value: BD.BigDecimal
}>

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
        className={classNames(`${INVOICE_FORM_CSS_PREFIX}__LineItem`, isReadOnly && `${INVOICE_FORM_CSS_PREFIX}__LineItem--readonly`)}
      >
        <form.Field name={`lineItems[${index}].accountIdentifier`}>
          {(field) => {
            return (
              <LedgerAccountCombobox
                label='Revenue account (hidden)'
                value={field.state.value}
                mode={CategoriesListMode.Revenue}
                onValueChange={field.setValue}
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

export type InvoiceFormMode = { mode: UpsertInvoiceMode.Update, invoice: Invoice } | { mode: UpsertInvoiceMode.Create }
export type InvoiceFormProps = {
  isReadOnly: boolean
  onSuccess: (invoice: Invoice) => void
  onChangeFormState?: (formState: InvoiceFormState) => void
}

export const InvoiceForm = forwardRef((props: InvoiceFormProps, ref) => {
  const viewState: InvoiceFormMode = useInvoiceDetail()
  const { mode } = viewState

  const { onSuccess, onChangeFormState, isReadOnly } = props
  const { form, formState, totals, submitError } = useInvoiceForm(
    { onSuccess, ...viewState },
  )
  const { subtotal, additionalDiscount, taxableSubtotal, taxes, grandTotal } = totals

  const initialLastDueAt = mode === UpsertInvoiceMode.Update
    ? viewState.invoice.dueAt !== null ? fromDate(viewState.invoice.dueAt, 'UTC') : null
    : null

  const lastDueAtRef = useRef<ZonedDateTime | null>(initialLastDueAt)

  const updateDueAtFromTermsAndSentAt = useCallback((terms: InvoiceTermsValues, sentAt: ZonedDateTime | null) => {
    if (sentAt == null) return

    const duration = getDurationInDaysFromTerms(terms)
    if (!duration) return

    const newDueAt = sentAt.add({ days: duration })
    const dueAtChanged = getDueAtChanged(lastDueAtRef.current, newDueAt)

    if (dueAtChanged) {
      form.setFieldValue('dueAt', newDueAt)
      lastDueAtRef.current = newDueAt
    }
  }, [form])

  // Prevents default browser form submission behavior since we're handling submission externally
  // via a custom handler (e.g., onClick). This ensures accidental native submits (like pressing
  // Enter or using a <button type="submit">) don’t trigger unexpected behavior.
  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  useImperativeHandle(ref, () => ({
    submit: ({ submitAction }: { submitAction: 'send' | null }) => form.handleSubmit({ submitAction }),
  }))

  useEffect(() => {
    onChangeFormState?.(formState)
  }, [formState, onChangeFormState])

  return (
    <Form className={INVOICE_FORM_CSS_PREFIX} onSubmit={blockNativeOnSubmit}>
      <form.Subscribe selector={state => state.errorMap}>
        {(errorMap) => {
          const validationErrors = flattenValidationErrors(errorMap)
          if (validationErrors.length > 0 || submitError) {
            return (
              <HStack className={`${INVOICE_FORM_CSS_PREFIX}__FormError`}>
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
                isReadOnly={isReadOnly}
                inline
              />
            )}
          </form.Field>
          <form.AppField name='email'>
            {field => (
              <field.FormTextField label='Email' inline className={`${INVOICE_FORM_FIELD_CSS_PREFIX}__Email`} isReadOnly />
            )}
          </form.AppField>
          <form.AppField name='address'>
            {field => (
              <field.FormTextAreaField label='Billing address' inline className={`${INVOICE_FORM_FIELD_CSS_PREFIX}__Address`} isReadOnly />
            )}
          </form.AppField>
        </VStack>
        <VStack gap='xs'>
          <form.AppField name='invoiceNumber'>
            {field =>
              <field.FormTextField label='Invoice number' inline className={`${INVOICE_FORM_FIELD_CSS_PREFIX}__InvoiceNo`} isReadOnly={isReadOnly} />}
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
                isReadOnly={isReadOnly}
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
            {field => <field.FormDateField label='Invoice date' inline className={`${INVOICE_FORM_FIELD_CSS_PREFIX}__SentAt`} isReadOnly={isReadOnly} />}
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
                }
                lastDueAtRef.current = dueAt
              },
            }}
          >
            {field => (
              <field.FormDateField label='Due date' inline className={`${INVOICE_FORM_FIELD_CSS_PREFIX}__DueAt`} isReadOnly={isReadOnly} />
            )}
          </form.AppField>
        </VStack>
      </HStack>
      <VStack className={`${INVOICE_FORM_CSS_PREFIX}__LineItems`} gap='md'>
        <form.Field name='lineItems' mode='array'>
          {field => (
            <VStack gap='xs' align='baseline'>
              {field.state.value.map((_value, index) => (
                /**
                 * A better implementation would use a UUID as the key for this line item row. Specifically, it's an antipattern in
                 * React to use array indices as keys. However, there are some ongoing issues with @tanstack/react-form related to
                 * deleting an element from an array field. In particular, the form values for the remaining array items may become
                 * momentarily undefined as they re-render due to re-indexing. Thus, we use indices here for now.
                 * See here for more information: https://github.com/TanStack/form/issues/1518.
                 */
                <InvoiceFormLineItemRow key={index} form={form} index={index} isReadOnly={isReadOnly} onDeleteLine={() => field.removeValue(index)} />
              ))}
              {!isReadOnly
                && (
                  <Button variant='outlined' onClick={() => field.pushValue(EMPTY_LINE_ITEM)}>
                    Add line item
                    <Plus size={16} />
                  </Button>
                )}
            </VStack>
          )}
        </form.Field>
        <VStack className={`${INVOICE_FORM_CSS_PREFIX}__Metadata`} pbs='md'>
          <HStack justify='space-between' gap='xl'>
            <VStack className={`${INVOICE_FORM_CSS_PREFIX}__AdditionalTextFields`}>
              <form.AppField name='memo'>
                {field => <field.FormTextAreaField label='Memo' isReadOnly={isReadOnly} />}
              </form.AppField>
            </VStack>
            <VStack className={`${INVOICE_FORM_CSS_PREFIX}__TotalFields`} fluid>
              <InvoiceFormTotalRow label='Subtotal' value={subtotal} />
              <InvoiceFormTotalRow label='Discount' value={negate(additionalDiscount)}>
                <form.AppField name='discountRate'>
                  {field => <field.FormBigDecimalField label='Discount' showLabel={false} mode='percent' isReadOnly={isReadOnly} />}
                </form.AppField>
              </InvoiceFormTotalRow>
              <InvoiceFormTotalRow label='Taxable subtotal' value={taxableSubtotal} />
              <InvoiceFormTotalRow label='Tax rate' value={taxes}>
                <form.AppField name='taxRate'>
                  {field => <field.FormBigDecimalField label='Tax Rate' showLabel={false} mode='percent' isReadOnly={isReadOnly} />}
                </form.AppField>
              </InvoiceFormTotalRow>
              <InvoiceFormTotalRow label='Total' value={grandTotal} />
            </VStack>
          </HStack>
        </VStack>
      </VStack>
    </Form>
  )
})
InvoiceForm.displayName = 'InvoiceForm'
