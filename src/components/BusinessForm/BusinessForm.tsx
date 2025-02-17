import { ENTITY_TYPES } from '../../types/business'
import { US_STATES } from '../../types/location'
import { notEmpty, validateEmailFormat } from '../../utils/form'
import { Input, InputGroup, Select } from '../Input'
import { HStack, VStack } from '../ui/Stack/Stack'
import { useBusinessForm } from './useBusinessForm'
import { findSelectOption } from './utils'
import { Text, TextSize } from '../Typography/Text'
import { SubmitButton } from '../Button'

export const BusinessForm = () => {
  const { form } = useBusinessForm()

  const entityTypeOptions = ENTITY_TYPES.map(state => ({
    label: state,
    value: state,
  }))

  const usStateOptions = US_STATES.map(state => ({
    label: state,
    value: state,
  }))

  return (
    <form
      className='Layer__business-form'
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >

      <VStack gap='sm'>
        <Text size={TextSize.sm}>Contact information</Text>

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
      </VStack>

      <VStack gap='sm'>
        <Text size={TextSize.sm}>Business information</Text>

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
                <Select
                  options={entityTypeOptions}
                  value={findSelectOption(entityTypeOptions, field.state.value)}
                  onChange={option => field.handleChange(option?.value as string)}
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
                  <Select
                    options={usStateOptions}
                    value={findSelectOption(usStateOptions, field.state.value)}
                    onChange={option => field.handleChange(option?.value as string)}
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

        <SubmitButton type='submit'>Save</SubmitButton>
      </VStack>
    </form>
  )
}
