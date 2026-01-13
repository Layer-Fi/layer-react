import { useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'
import type React from 'react'

import { type Customer } from '@schemas/customer'
import { flattenValidationErrors } from '@utils/form'
import { Button } from '@ui/Button/Button'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { useCustomerForm } from '@components/CustomerForm/useCustomerForm'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { TextSize } from '@components/Typography/Text'

import './customerForm.scss'

const CUSTOMER_FORM_CSS_PREFIX = 'Layer__CustomerForm'
const CUSTOMER_FORM_FIELD_CSS_PREFIX = `${CUSTOMER_FORM_CSS_PREFIX}__Field`

export type CustomerFormProps = {
  customer: Customer | null
  isReadOnly?: boolean
  onSuccess: (customer: Customer) => void
}

export const CustomerForm = (props: CustomerFormProps) => {
  const { onSuccess, customer, isReadOnly } = props
  const { form, submitError } = useCustomerForm({ onSuccess, customer })

  // Prevents default browser form submission behavior
  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <Form className={CUSTOMER_FORM_CSS_PREFIX} onSubmit={blockNativeOnSubmit}>
      <form.Subscribe selector={state => state.errorMap}>
        {(errorMap) => {
          const validationErrors = flattenValidationErrors(errorMap)
          if (validationErrors.length > 0 || submitError) {
            return (
              <HStack className={`${CUSTOMER_FORM_CSS_PREFIX}__FormError`}>
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

      <form.AppField name='individualName'>
        {field => (
          <field.FormTextField
            label='Individual name'
            inline
            isReadOnly={isReadOnly}
            placeholder='Enter individual name'
            className={`${CUSTOMER_FORM_FIELD_CSS_PREFIX}__IndividualName`}
          />
        )}
      </form.AppField>

      <form.AppField name='companyName'>
        {field => (
          <field.FormTextField
            label='Company name'
            inline
            isReadOnly={isReadOnly}
            placeholder='Enter company name'
            className={`${CUSTOMER_FORM_FIELD_CSS_PREFIX}__CompanyName`}
          />
        )}
      </form.AppField>

      <form.AppField name='email'>
        {field => (
          <field.FormTextField
            label='Email'
            inline
            isReadOnly={isReadOnly}
            placeholder='Enter email address'
            className={`${CUSTOMER_FORM_FIELD_CSS_PREFIX}__Email`}
          />
        )}
      </form.AppField>

      <form.AppField name='addressString'>
        {field => (
          <field.FormTextAreaField
            label='Address'
            inline
            isReadOnly={isReadOnly}
            placeholder='Enter address'
            className={`${CUSTOMER_FORM_FIELD_CSS_PREFIX}__Address`}
          />
        )}
      </form.AppField>

      <VStack justify='end' className={`${CUSTOMER_FORM_CSS_PREFIX}__Submit`}>
        <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type='submit'
              isDisabled={!canSubmit}
              isPending={isSubmitting}
              onPress={() => { void form.handleSubmit() }}
            >
              Save Customer
            </Button>
          )}
        </form.Subscribe>
      </VStack>
    </Form>
  )
}
