import { type FormEvent, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type CustomAccount, CustomAccountSubtype } from '@internal-types/customAccounts'
import { notEmpty } from '@utils/form'
import { translationKey } from '@utils/i18n/translationKey'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { FieldError, TextField } from '@ui/Form/Form'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { Button, ButtonVariant } from '@components/Button/Button'
import { SubmitButton } from '@components/Button/SubmitButton'
import { useCustomAccountForm } from '@components/CustomAccountForm/useCustomAccountForm'
import { ErrorText } from '@components/Typography/ErrorText'

import './customAccountForm.scss'

const accountTypeConfig = [
  { value: CustomAccountSubtype.CHECKING, ...translationKey('common:label.checking', 'Checking') },
  { value: CustomAccountSubtype.SAVINGS, ...translationKey('common:label.savings', 'Savings') },
  { value: CustomAccountSubtype.CREDIT_CARD, ...translationKey('common:label.credit_card', 'Credit Card') },
]

export type CustomAccountsFormProps = {
  initialAccountName: string
  onCancel?: () => void
  onSuccess?: (account: CustomAccount) => void
}

export const CustomAccountForm = ({ initialAccountName, onCancel, onSuccess }: CustomAccountsFormProps) => {
  const { t } = useTranslation()
  const { form, submitError, isFormValid } = useCustomAccountForm({ onSuccess })

  const accountTypeOptions = useMemo(
    () => accountTypeConfig.map(opt => ({
      value: opt.value,
      label: t(opt.i18nKey, opt.defaultValue),
    })),
    [t],
  )

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
            onSubmit: ({ value }) => notEmpty(value) ? undefined : t('generalLedger:validation.account_name_required', 'Account name is required'),
          }}
        >
          {field => (
            <TextField
              name='account_name'
              isInvalid={field.state.meta.errors.length > 0}
              className='Layer__custom-account-form__field'
            >
              <Label slot='label' size='sm' htmlFor='account_name' pbe='3xs'>
                {t('generalLedger:label.account_name', 'Account name')}
              </Label>
              <InputGroup slot='input'>
                <Input
                  inset
                  id='account_name'
                  name='account_name'
                  placeholder={t('generalLedger:label.enter_account_name', 'Enter account name...')}
                  value={field.state.value}
                  onChange={e =>
                    field.handleChange((e.target as HTMLInputElement).value)}
                />
              </InputGroup>
              <FieldError>{field.state.meta.errors.join(', ')}</FieldError>
            </TextField>
          )}
        </form.Field>

        <form.Field
          name='institution_name'
          validators={{
            onSubmit: ({ value }) => notEmpty(value) ? undefined : t('generalLedger:validation.institution_name_required', 'Institution name is required'),
          }}
        >
          {field => (
            <TextField
              name='institution_name'
              isInvalid={field.state.meta.errors.length > 0}
              className='Layer__custom-account-form__field'
            >
              <Label slot='label' size='sm' htmlFor='institution_name' pbe='3xs'>
                {t('generalLedger:label.institution_name', 'Institution name')}
              </Label>
              <InputGroup slot='input'>
                <Input
                  inset
                  id='institution_name'
                  name='institution_name'
                  placeholder={t('generalLedger:label.enter_institution_name', 'Enter institution name...')}
                  value={field.state.value}
                  onChange={e =>
                    field.handleChange((e.target as HTMLInputElement).value)}
                />
              </InputGroup>
              <FieldError>{field.state.meta.errors.join(', ')}</FieldError>
            </TextField>
          )}
        </form.Field>

        <form.Field
          name='account_type'
          validators={{
            onSubmit: ({ value }) => notEmpty(value) ? undefined : t('generalLedger:validation.account_type_required', 'Account type is required'),
          }}
        >
          {field => (
            <VStack className='Layer__custom-account-form__field'>
              <Label size='sm' htmlFor='account_type' pbe='3xs'>
                {t('generalLedger:label.account_type', 'Account type')}
              </Label>
              <ComboBox
                className='Layer__custom-account-form__input'
                name='account_type'
                placeholder={t('generalLedger:action.select_account_type', 'Select account type...')}
                options={accountTypeOptions}
                selectedValue={accountTypeOptions.find(opt => opt.value === field.state.value) ?? null}
                onSelectedValueChange={option => field.handleChange(option?.value)}
                isClearable={false}
                isError={field.state.meta.errors.length > 0}
                slots={{ ErrorMessage: field.state.meta.errors.join(', ') }}
              />
            </VStack>
          )}
        </form.Field>

        <HStack gap='xs' pbs='xs'>
          {!isFormValid && (
            <ErrorText pb='xs'>
              {t('generalLedger:error.check_fields', 'Please check all fields.')}
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
              {t('common:action.cancel_label', 'Cancel')}
            </Button>
          )}
          <SubmitButton
            type='submit'
            processing={isSubmitting}
            noIcon={!isSubmitting}
            withRetry
            error={submitError}
          >
            {submitError
              ? t('common:action.retry_label', 'Retry')
              : t('generalLedger:action.save_account', 'Save Account')}
          </SubmitButton>
        </HStack>
      </VStack>
    </form>
  )
}
