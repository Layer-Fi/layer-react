import { notEmpty, validateEmailFormat } from '../../utils/form'
import { Input, InputGroup } from '../Input'
import { useBusinessForm } from './useBusinessForm'

export const BusinessForm = () => {
  const { form } = useBusinessForm()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void form.handleSubmit()
      }}
    >

      <form.Field
        name='first_name'
        validators={{
          onBlur: ({ value }) => notEmpty(value) ? undefined : 'First name is required',
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
          onBlur: ({ value }) => notEmpty(value) ? undefined : 'Last name is required',
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

      <form.Field
        name='email'
        validators={{
          onBlur: ({ value }) => validateEmailFormat(value, true) ? undefined : 'Email is invalid',
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
    </form>
  )
}
