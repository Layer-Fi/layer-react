import { useCallback } from 'react'
import { AlertTriangle, Save } from 'lucide-react'
import type React from 'react'

import { type Customer } from '@schemas/customer'
import { flattenValidationErrors } from '@utils/form'
import { Button } from '@ui/Button/Button'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { type CustomerFormState } from '@components/CustomerForm/formUtils'
import { useCustomerForm } from '@components/CustomerForm/useCustomerForm'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { TextSize } from '@components/Typography/Text'

import './customerForm.scss'

type CustomerFormBaseProps = {
  isReadOnly?: boolean
  onSuccess: (customer: Customer) => void
}

export type CustomerFormProps = CustomerFormBaseProps & CustomerFormState
export const CustomerForm = ({ onSuccess, isReadOnly, ...formState }: CustomerFormProps) => {
  const { form, submitError } = useCustomerForm({ onSuccess, ...formState })

  // Prevents default browser form submission behavior
  const blockNativeOnSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  return (
    <Form className='Layer__CustomerForm' onSubmit={blockNativeOnSubmit}>
      <form.Subscribe selector={state => state.errorMap}>
        {(errorMap) => {
          const validationErrors = flattenValidationErrors(errorMap)
          if (validationErrors.length > 0 || submitError) {
            return (
              <HStack className='Layer__CustomerForm__FormError'>
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
            className='Layer__CustomerForm__Field__IndividualName'
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
            className='Layer__CustomerForm__Field__CompanyName'
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
            className='Layer__CustomerForm__Field__Email'
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
            className='Layer__CustomerForm__Field__Address'
          />
        )}
      </form.AppField>

      <VStack justify='end' className='Layer__CustomerForm__Submit'>
        <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type='submit'
              isDisabled={!canSubmit}
              isPending={isSubmitting}
              onPress={() => { void form.handleSubmit() }}
            >
              <Save size={14} />
              Save Customer
            </Button>
          )}
        </form.Subscribe>
      </VStack>
    </Form>
  )
}
