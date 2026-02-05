import { useCallback, useRef } from 'react'
import { fromDate, toCalendarDate, type ZonedDateTime } from '@internationalized/date'

import { useInvoiceDetail } from '@providers/InvoicesRouteStore/InvoicesRouteStoreProvider'
import { Button } from '@ui/Button/Button'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import type { InvoiceFormType } from '@components/Invoices/InvoiceForm/useInvoiceForm'
import { getDurationInDaysFromTerms, InvoiceTermsComboBox, InvoiceTermsValues } from '@components/Invoices/InvoiceTermsComboBox/InvoiceTermsComboBox'
import { CustomerSelector } from '@features/customers/components/CustomerSelector'

import './invoiceFormTermsSection.scss'

const getDueAtChanged = (dueAt: ZonedDateTime | null, previousDueAt: ZonedDateTime | null) =>
  (dueAt === null && previousDueAt !== null)
  || (dueAt !== null && previousDueAt === null)
  || (dueAt !== null && previousDueAt !== null && toCalendarDate(dueAt).compare(toCalendarDate(previousDueAt)) !== 0)

type InvoiceFormTermsSectionProps = {
  form: InvoiceFormType
  enableCustomerManagement: boolean
  initialDueAt: Date | null
  onClickEditCustomer: () => void
  onClickCreateNewCustomer: (inputValue: string) => void
}

export const InvoiceFormTermsSection = ({
  form,
  enableCustomerManagement,
  initialDueAt,
  onClickEditCustomer,
  onClickCreateNewCustomer,
}: InvoiceFormTermsSectionProps) => {
  const { isReadOnly } = useInvoiceDetail()

  const initialLastDueAt = initialDueAt !== null ? fromDate(initialDueAt, 'UTC') : null
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

  return (
    <HStack gap='xl' className='Layer__InvoiceForm__Terms'>
      <VStack gap='xs'>
        <VStack align='end' gap='3xs'>
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
                className='Layer__InvoiceForm__Field__Customer'
                selectedCustomer={field.state.value}
                onSelectedCustomerChange={field.handleChange}
                isReadOnly={isReadOnly}
                isCreatable={enableCustomerManagement}
                onCreateCustomer={onClickCreateNewCustomer}
                inline
              />
            )}
          </form.Field>
          {enableCustomerManagement && !isReadOnly && (
            <form.Subscribe selector={state => state.values.customer}>
              {customer => customer && (
                <HStack>
                  <Button variant='text' onPress={onClickEditCustomer}>
                    <Span size='sm'>Edit customer details</Span>
                  </Button>
                </HStack>
              )}
            </form.Subscribe>
          )}
        </VStack>
        <form.AppField name='email'>
          {field => (
            <field.FormTextField label='Email' inline className='Layer__InvoiceForm__Field__Email' isReadOnly />
          )}
        </form.AppField>
        <form.AppField name='address'>
          {field => (
            <field.FormTextAreaField label='Billing address' inline className='Layer__InvoiceForm__Field__Address' isReadOnly />
          )}
        </form.AppField>
      </VStack>
      <VStack gap='xs'>
        <form.AppField name='invoiceNumber'>
          {field =>
            <field.FormTextField label='Invoice number' inline className='Layer__InvoiceForm__Field__InvoiceNo' isReadOnly={isReadOnly} />}
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
          {field => <field.FormDatePickerField label='Invoice date' inline className='Layer__InvoiceForm__Field__SentAt' isReadOnly={isReadOnly} />}
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
            <field.FormDatePickerField label='Due date' inline className='Layer__InvoiceForm__Field__DueAt' isReadOnly={isReadOnly} />
          )}
        </form.AppField>
      </VStack>
    </HStack>
  )
}
