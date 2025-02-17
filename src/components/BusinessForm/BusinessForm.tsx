import { notEmpty, validateEmailFormat } from '../../utils/form'
import { Input, InputGroup } from '../Input'
import { HStack } from '../ui/Stack/Stack'
import { useBusinessForm } from './useBusinessForm'
import { SubmitButton } from '../Button'
import { FormSection } from '../Input/FormSection'
import { BusinessTypeSelect } from '../BusinessTypeSelect/BusinessTypeSelect'
import { UsStateSelect } from '../UsStateSelect/UsStateSelect'

export const BusinessForm = () => {
  const { form } = useBusinessForm()

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
        <HStack gap='sm'>
          <form.Field
            name='first_name'
            validators={{
              onSubmit: ({ value }) => notEmpty(value) ? undefined : 'First name is required',
            }}
          >
            {field => (
              <>
                <InputGroup name='first_name' label='First name'>
                  <Input
                    name='first_name'
                    placeholder='John'
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

          <form.Field
            name='last_name'
            validators={{
              onSubmit: ({ value }) => notEmpty(value) ? undefined : 'Last name is required',
            }}
          >
            {field => (
              <>
                <InputGroup name='last_name' label='Last name'>
                  <Input
                    name='last_name'
                    placeholder='Doe'
                    value={field.state.value}
                    onChange={e => field.handleChange((e.target as HTMLInputElement).value)}
                    isInvalid={field.state.meta.errors.length > 0}
                    errorMessage={field.state.meta.errors.join(', ')}
                  />
                </InputGroup>
              </>
            )}
          </form.Field>
        </HStack>

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
                label='What’s the email you want to use for bookkeeping communication?'
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

        <form.Field name='phone_number'>
          {field => (
            <>
              <InputGroup
                name='phone_number'
                label='What’s the phone number you want to use for bookkeeping communication?'
              >
                <Input
                  name='phone_number'
                  placeholder='1-212-456-7890'
                  value={field.state.value}
                  onChange={e => field.handleChange((e.target as HTMLInputElement).value)}
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
              <InputGroup name='legal_name' label='Company'>
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

        <form.Field name='dba'>
          {field => (
            <>
              <InputGroup name='dba' label='DBA (optional)'>
                <Input
                  name='dba'
                  placeholder='Alternative name'
                  value={field.state.value}
                  onChange={e => field.handleChange((e.target as HTMLInputElement).value)}
                  isInvalid={field.state.meta.errors.length > 0}
                  errorMessage={field.state.meta.errors.join(', ')}
                />
              </InputGroup>
            </>
          )}
        </form.Field>

        <form.Field name='type'>
          {field => (
            <>
              <InputGroup name='type' label='Entity type'>
                <BusinessTypeSelect
                  value={field.state.value}
                  onChange={value => field.handleChange(value)}
                />
              </InputGroup>
            </>
          )}
        </form.Field>

        <HStack gap='sm'>
          <form.Field name='us_state'>
            {field => (
              <>
                <InputGroup name='us_state' label='State'>
                  <UsStateSelect
                    value={field.state.value}
                    onChange={value => field.handleChange(value)}
                  />
                </InputGroup>
              </>
            )}
          </form.Field>

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
        </HStack>
      </FormSection>

      <SubmitButton noIcon type='submit'>Save</SubmitButton>
    </form>
  )
}
