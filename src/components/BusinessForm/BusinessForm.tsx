import { notEmpty, validateEmailFormat } from '../../utils/form'
import { Input, InputGroup } from '../Input'
import { useBusinessForm } from './useBusinessForm'
import { SubmitButton } from '../Button'
import { FormSection } from '../Input/FormSection'
import { BusinessTypeSelect } from '../Input/BusinessTypeSelect'
import { USStateSelect } from '../Input/USStateSelect'
import { PhoneInput } from '../Input/PhoneInput'
import { isPossiblePhoneNumber } from 'libphonenumber-js'
import { ErrorText } from '../Typography'

export type BusinessFormStringOverrides = {
  saveButton?: string
}

export type BusinessFormVariant = 'lightweight' | 'full'

export type BusinessFormProps = {
  stringOverrides?: BusinessFormStringOverrides
  onSuccess?: () => void
  variant?: BusinessFormVariant
}

export const BusinessForm = ({ stringOverrides, onSuccess, variant = 'lightweight' }: BusinessFormProps) => {
  const { form, submitError, isFormValid } = useBusinessForm({ onSuccess, variant })

  const { isSubmitting } = form.state

  return (
    <form
      className='Layer__form Layer__business-form'
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <FormSection title='Contact information'>
        <div className='Layer__business-form__name-fields'>
          <form.Field
            name='full_name'
            validators={{
              onSubmit: ({ value }) => notEmpty(value) ? undefined : 'Full name is required',
            }}
          >
            {field => (
              <>
                <InputGroup name='full_name' label='Full name'>
                  <Input
                    name='full_name'
                    placeholder='John Doe'
                    value={field.state.value}
                    onChange={e =>
                      field.handleChange((e.target as HTMLInputElement).value)}
                    isInvalid={field.state.meta.errors.length > 0}
                    errorMessage={field.state.meta.errors.join(', ')}
                  />
                </InputGroup>
              </>
            )}
          </form.Field>

          {variant === 'full' && (
            <form.Field name='preferred_name'>
              {field => (
                <>
                  <InputGroup name='preferred_name' label='Preferred name'>
                    <Input
                      name='preferred_name'
                      placeholder='John'
                      value={field.state.value}
                      onChange={e => field.handleChange((e.target as HTMLInputElement).value)}
                    />
                  </InputGroup>
                </>
              )}
            </form.Field>
          )}
        </div>

        <form.Field
          name='email'
          validators={{
            onSubmit: ({ value }) => validateEmailFormat(value, true) ? undefined : 'Email is invalid',
          }}
        >
          {field => (
            <>
              <InputGroup
                name='email'
                label='Email'
              >
                <Input
                  name='email'
                  placeholder='john@company.com'
                  value={field.state.value}
                  onChange={e => field.handleChange((e.target as HTMLInputElement).value)}
                  isInvalid={field.state.meta.errors.length > 0}
                  errorMessage={field.state.meta.errors.join(', ')}
                />
              </InputGroup>
            </>
          )}
        </form.Field>

        <form.Field
          name='phone_number'
          validators={{
            onSubmit: ({ value }) => isPossiblePhoneNumber(value ?? '', 'US') ? undefined : 'Phone number is invalid',
          }}
        >
          {field => (
            <>
              <InputGroup
                name='phone_number'
                label='Phone'
              >
                <PhoneInput
                  value={field.state.value}
                  onChange={value => field.handleChange(value)}
                  isInvalid={field.state.meta.errors.length > 0}
                  errorMessage={field.state.meta.errors.join(', ')}
                />
              </InputGroup>
            </>
          )}
        </form.Field>
      </FormSection>

      <FormSection title='Business information'>
        <form.Field
          name='legal_name'
          validators={{
            onBlur: ({ value }) => notEmpty(value) ? undefined : 'Company name is required',
          }}
        >
          {field => (
            <>
              <InputGroup name='legal_name' label='Company name'>
                <Input
                  name='legal_name'
                  placeholder='Company'
                  value={field.state.value}
                  onChange={e => field.handleChange((e.target as HTMLInputElement).value)}
                  isInvalid={field.state.meta.errors.length > 0}
                  errorMessage={field.state.meta.errors.join(', ')}
                />
              </InputGroup>
            </>
          )}
        </form.Field>

        <form.Field name='entity_type'>
          {field => (
            <>
              <InputGroup name='entity_type' label='Entity type'>
                <BusinessTypeSelect
                  value={field.state.value}
                  onChange={value => field.handleChange(value)}
                />
              </InputGroup>
            </>
          )}
        </form.Field>

        <div className='Layer__business-form__state-tin-fields'>
          <form.Field name='us_state'>
            {field => (
              <>
                <InputGroup name='us_state' label='State' className='Layer__business-form__state'>
                  <USStateSelect
                    value={field.state.value}
                    onChange={option => field.handleChange(option.value)}
                  />
                </InputGroup>
              </>
            )}
          </form.Field>

          {variant === 'full' && (
            <form.Field name='tin'>
              {field => (
                <>
                  <InputGroup name='tin' label='Tax ID number (optional)'>
                    <Input
                      name='tin'
                      placeholder='Tax ID number'
                      value={field.state.value}
                      onChange={e => field.handleChange((e.target as HTMLInputElement).value)}
                      isInvalid={field.state.meta.errors.length > 0}
                      errorMessage={field.state.meta.errors.join(', ')}
                    />
                  </InputGroup>
                </>
              )}
            </form.Field>
          )}
        </div>
      </FormSection>

      <SubmitButton
        type='submit'
        processing={isSubmitting}
        noIcon
        withRetry
        error={submitError}
      >
        {stringOverrides?.saveButton ?? 'Next'}
      </SubmitButton>

      {!isFormValid && (
        <ErrorText pb='xs'>
          Please check all fields.
        </ErrorText>
      )}
    </form>
  )
}
