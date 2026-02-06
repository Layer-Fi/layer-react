import { useCallback, useEffect } from 'react'
import { AlertTriangle, Save } from 'lucide-react'
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

type InvoiceFinalizeFormProps = {
  invoice: Invoice
  initialPaymentMethods: readonly InvoicePaymentMethod[]
  onSuccess: (invoice: Invoice) => void
  onChangeFormState?: (formState: InvoiceFinalizeFormState) => void
}

export const InvoiceFinalizeForm = ({
  invoice,
  initialPaymentMethods,
  onSuccess,
  onChangeFormState,
}: InvoiceFinalizeFormProps) => {
  const { form, formState, submitError } = useInvoiceFinalizeForm({
    invoice,
    initialPaymentMethods,
    onSuccess,
  })

  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  useEffect(() => {
    onChangeFormState?.(formState)
  }, [formState, onChangeFormState])

  return (
    <Form className='Layer__InvoiceFinalizeForm' onSubmit={blockNativeOnSubmit}>
      <form.Subscribe selector={state => state.errorMap}>
        {(errorMap) => {
          const validationErrors = flattenValidationErrors(errorMap)
          if (validationErrors.length > 0 || submitError) {
            return (
              <HStack className='Layer__InvoiceFinalizeForm__FormError'>
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
      <VStack className='Layer__InvoiceFinalizeForm__Section' gap='sm'>
        <Heading level={3} size='sm'>Payment methods</Heading>
        <form.AppField name='achEnabled'>
          {field => (
            <field.FormSwitchField
              label='ACH'
              slot={{ LabelIcon: <InstitutionIcon size={14} /> }}
              inline
            />
          )}
        </form.AppField>
        <form.AppField name='creditCardEnabled'>
          {field => (
            <field.FormSwitchField
              label='Credit Card'
              slot={{ LabelIcon: <CreditCardIcon size={14} /> }}
              inline
            />
          )}
        </form.AppField>
      </VStack>
      <VStack className='Layer__InvoiceFinalizeForm__Section' gap='sm'>
        <Heading level={3} size='sm'>Custom Payment Instructions</Heading>
        <form.AppField name='customPaymentInstructions'>
          {field => (
            <field.FormTextAreaField
              label='Custom Payment Instructions'
              showLabel={false}
              className='Layer__InvoiceFinalizeForm__Field__CustomPaymentInstructions'
              placeholder='Add custom payment instructions'
            />
          )}
        </form.AppField>
        <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <HStack className='Layer__InvoiceFinalizeForm__Submit' justify='end'>
              <Button type='submit' isDisabled={!canSubmit} isPending={isSubmitting} onPress={() => { void form.handleSubmit() }}>
                Save
                <Save size={14} />
              </Button>
            </HStack>
          )}
        </form.Subscribe>
      </VStack>
    </Form>
  )
}
