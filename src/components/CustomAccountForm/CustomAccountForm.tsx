import { useCallback, useEffect, FormEvent } from 'react'
import { notEmpty } from '../../utils/form'
import { Input, InputGroup, Select } from '../Input'
import { useCustomAccountForm } from './useCustomAccountForm'
import { Button, ButtonVariant, SubmitButton } from '../Button'
import { ErrorText } from '../Typography'
import { Spacer, HStack, VStack } from '../../components/ui/Stack/Stack'
import { type CustomAccount, CustomAccountSubtype } from '../../hooks/customAccounts/types'

const accountTypeOptions = [
  { value: CustomAccountSubtype.CHECKING, label: 'Checking' },
  { value: CustomAccountSubtype.SAVINGS, label: 'Savings' },
  { value: CustomAccountSubtype.CREDIT_CARD, label: 'Credit Card' },
]

export type CustomAccountsFormProps = {
  initialAccountName: string
  onCancel?: () => void
  onSuccess?: (account: CustomAccount) => void
}

export const CustomAccountForm = ({ initialAccountName, onCancel, onSuccess }: CustomAccountsFormProps) => {
  const { form, submitError, isFormValid } = useCustomAccountForm({ onSuccess })

  const { isSubmitting } = form.state
  const onSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    void form.handleSubmit()
  }, [form])

  useEffect(() => {
    form.setFieldValue('account_name', initialAccountName)
  }, [form, initialAccountName])

  return (
    <form
      className='Layer__form Layer__custom-account-form'
      onSubmit={onSubmit}
    >
      <VStack gap='xs'>
        <form.Field
          name='account_name'
          validators={{
            onSubmit: ({ value }) => notEmpty(value) ? undefined : 'Account name is required',
          }}
        >
          {field => (
            <>
              <InputGroup name='account_name' label='Account name'>
                <Input
                  className='Layer__custom-account-form__input'
                  name='account_name'
                  placeholder='Enter account name...'
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
          name='institution_name'
          validators={{
            onSubmit: ({ value }) => notEmpty(value) ? undefined : 'Institution name is required',
          }}
        >
          {field => (
            <>
              <InputGroup name='institution_name' label='Institution name'>
                <Input
                  className='Layer__custom-account-form__input'
                  name='institution_name'
                  placeholder='Enter institution name...'
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
          name='account_type'
          validators={{
            onSubmit: ({ value }) => notEmpty(value) ? undefined : 'Account type is required',
          }}
        >
          {field => (
            <>
              <InputGroup name='account_type' label='Account type'>
                <Select
                  className='Layer__custom-account-form__input'
                  name='account_type'
                  placeholder='Select account type...'
                  options={accountTypeOptions}
                  value={accountTypeOptions.find(opt => opt.value === field.state.value) || null}
                  onChange={option => field.handleChange(option?.value)}
                  isInvalid={field.state.meta.errors.length > 0}
                  errorMessage={field.state.meta.errors.join(', ')}
                />
              </InputGroup>
            </>
          )}
        </form.Field>

        <HStack gap='xs' pbs='xs'>
          {!isFormValid && (
            <ErrorText pb='xs'>
              Please check all fields.
            </ErrorText>
          )}
          {submitError && (
            <ErrorText pb='xs'>
              {submitError}
            </ErrorText>
          )}
          <Spacer />
          {onCancel && (
            <Button type='button' variant={ButtonVariant.secondary} onClick={onCancel}>
              Cancel
            </Button>
          )}
          <SubmitButton
            type='submit'
            processing={isSubmitting}
            noIcon={!isSubmitting}
            withRetry
            error={submitError}
          >
            {submitError ? 'Retry' : 'Save Account'}
          </SubmitButton>
        </HStack>
      </VStack>
    </form>
  )
}
