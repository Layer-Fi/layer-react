import { forwardRef, useCallback, useEffect, useImperativeHandle } from 'react'
import { AlertTriangle, Send } from 'lucide-react'
import type React from 'react'

import { flattenValidationErrors } from '@utils/form'
import CreditCardIcon from '@icons/CreditCard'
import InstitutionIcon from '@icons/InstitutionIcon'
import { Button } from '@ui/Button/Button'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Heading } from '@ui/Typography/Heading'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import {
  type InvoiceFinalizeFormState,
  useInvoiceFinalizeForm,
} from '@components/Invoices/InvoicePreview/InvoiceFinalizeForm/useInvoiceFinalizeForm'
import { TextSize } from '@components/Typography/Text'
import type { InvoicePaymentMethod } from '@features/invoices/invoicePaymentMethodSchemas'
import type { Invoice } from '@features/invoices/invoiceSchemas'

import './invoiceFinalizeForm.scss'

const INVOICE_FINALIZE_FORM_CSS_PREFIX = 'Layer__InvoiceFinalizeForm'
const INVOICE_FINALIZE_FORM_FIELD_CSS_PREFIX = `${INVOICE_FINALIZE_FORM_CSS_PREFIX}__Field`

export type InvoiceFinalizeFormRef = {
  submit: () => Promise<void>
}

type InvoiceFinalizeFormProps = {
  invoice: Invoice
  initialPaymentMethods: readonly InvoicePaymentMethod[]
  onSuccess: (invoice: Invoice) => void
  onChangeFormState?: (formState: InvoiceFinalizeFormState) => void
}

export const InvoiceFinalizeForm = forwardRef<
  InvoiceFinalizeFormRef,
  InvoiceFinalizeFormProps
>(({
  invoice,
  initialPaymentMethods,
  onSuccess,
  onChangeFormState,
}, ref) => {
  const { form, formState, submitError } = useInvoiceFinalizeForm({
    invoice,
    initialPaymentMethods,
    onSuccess,
  })

  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  useImperativeHandle(ref, () => ({
    submit: () => form.handleSubmit(),
  }))

  useEffect(() => {
    onChangeFormState?.(formState)
  }, [formState, onChangeFormState])

  return (
    <Form className={INVOICE_FINALIZE_FORM_CSS_PREFIX} onSubmit={blockNativeOnSubmit}>
      <form.Subscribe selector={state => state.errorMap}>
        {(errorMap) => {
          const validationErrors = flattenValidationErrors(errorMap)
          if (validationErrors.length > 0 || submitError) {
            return (
              <HStack className={`${INVOICE_FINALIZE_FORM_CSS_PREFIX}__FormError`}>
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
      <VStack className={`${INVOICE_FINALIZE_FORM_CSS_PREFIX}__Section`} gap='sm'>
        <Heading level={3} size='sm'>Payment methods</Heading>
        <form.AppField name='achEnabled'>
          {field => (
            <field.FormSwitchField
              label='ACH'
              labelIcon={<InstitutionIcon size={14} />}
              inline
              className={`${INVOICE_FINALIZE_FORM_FIELD_CSS_PREFIX}__Ach`}
            />
          )}
        </form.AppField>
        <form.AppField name='creditCardEnabled'>
          {field => (
            <field.FormSwitchField
              label='Credit Card'
              labelIcon={<CreditCardIcon size={14} />}
              inline
              className={`${INVOICE_FINALIZE_FORM_FIELD_CSS_PREFIX}__CreditCard`}
            />
          )}
        </form.AppField>
      </VStack>
      <VStack className={`${INVOICE_FINALIZE_FORM_CSS_PREFIX}__Section`} gap='sm'>
        <Heading level={3} size='sm'>Custom Payment Instructions</Heading>
        <form.AppField name='customPaymentInstructions'>
          {field => (
            <field.FormTextAreaField
              label='Instructions'
              showLabel={false}
              className={`${INVOICE_FINALIZE_FORM_FIELD_CSS_PREFIX}__CustomPaymentInstructions`}
              placeholder='Add custom payment instructions'
            />
          )}
        </form.AppField>
        <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <HStack className={`${INVOICE_FINALIZE_FORM_CSS_PREFIX}__Submit`} justify='start'>
              <Button type='submit' isDisabled={!canSubmit} isPending={isSubmitting} onPress={() => { void form.handleSubmit() }}>
                Save
                <Send size={14} />
              </Button>
            </HStack>
          )}
        </form.Subscribe>
      </VStack>
    </Form>
  )
})

InvoiceFinalizeForm.displayName = 'InvoiceFinalizeForm'
