import { type FormEvent, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type CustomAccount, CustomAccountSubtype } from '@internal-types/customAccounts'
import { notEmpty } from '@utils/form'
import { translationKey } from '@utils/i18n/translationKey'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Button, ButtonVariant } from '@components/Button/Button'
import { SubmitButton } from '@components/Button/SubmitButton'
import { useCustomAccountForm } from '@components/CustomAccountForm/useCustomAccountForm'
import { Input } from '@components/Input/Input'
import { InputGroup } from '@components/Input/InputGroup'
import { Select } from '@components/Input/Select'
import { ErrorText } from '@components/Typography/ErrorText'

import './customAccountForm.scss'

const accountTypeConfig = [
  { value: CustomAccountSubtype.CHECKING, ...translationKey('common.checking', 'Checking') },
  { value: CustomAccountSubtype.SAVINGS, ...translationKey('common.savings', 'Savings') },
  { value: CustomAccountSubtype.CREDIT_CARD, ...translationKey('common.creditCard', 'Credit Card') },
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
            onSubmit: ({ value }) => notEmpty(value) ? undefined : t('generalLedger.accountNameIsRequired', 'Account name is required'),
          }}
        >
          {field => (
            <InputGroup name='account_name' label={t('generalLedger.accountName', 'Account name')} className='Layer__custom-account-form__field'>
              <Input
                className='Layer__custom-account-form__input'
                name='account_name'
                placeholder={t('generalLedger.enterAccountName', 'Enter account name...')}
                value={field.state.value}
                onChange={e =>
                  field.handleChange((e.target as HTMLInputElement).value)}
                isInvalid={field.state.meta.errors.length > 0}
                errorMessage={field.state.meta.errors.join(', ')}
              />
            </InputGroup>
          )}
        </form.Field>

        <form.Field
          name='institution_name'
          validators={{
            onSubmit: ({ value }) => notEmpty(value) ? undefined : t('generalLedger.institutionNameIsRequired', 'Institution name is required'),
          }}
        >
          {field => (
            <InputGroup name='institution_name' label={t('generalLedger.institutionName', 'Institution name')} className='Layer__custom-account-form__field'>
              <Input
                className='Layer__custom-account-form__input'
                name='institution_name'
                placeholder={t('generalLedger.enterInstitutionName', 'Enter institution name...')}
                value={field.state.value}
                onChange={e =>
                  field.handleChange((e.target as HTMLInputElement).value)}
                isInvalid={field.state.meta.errors.length > 0}
                errorMessage={field.state.meta.errors.join(', ')}
              />
            </InputGroup>
          )}
        </form.Field>

        <form.Field
          name='account_type'
          validators={{
            onSubmit: ({ value }) => notEmpty(value) ? undefined : t('generalLedger.accountTypeIsRequired', 'Account type is required'),
          }}
        >
          {field => (
            <InputGroup name='account_type' label={t('generalLedger.accountType', 'Account type')} className='Layer__custom-account-form__field'>
              <Select
                className='Layer__custom-account-form__input'
                name='account_type'
                placeholder={t('generalLedger.selectAccountType', 'Select account type...')}
                options={accountTypeOptions}
                value={accountTypeOptions.find(opt => opt.value === field.state.value) || null}
                onChange={option => field.handleChange(option?.value)}
                isInvalid={field.state.meta.errors.length > 0}
                errorMessage={field.state.meta.errors.join(', ')}
              />
            </InputGroup>
          )}
        </form.Field>

        <HStack gap='xs' pbs='xs'>
          {!isFormValid && (
            <ErrorText pb='xs'>
              {t('generalLedger.pleaseCheckAllFields', 'Please check all fields.')}
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
              {t('common.cancel', 'Cancel')}
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
              ? t('common.retry', 'Retry')
              : t('generalLedger.saveAccount', 'Save Account')}
          </SubmitButton>
        </HStack>
      </VStack>
    </form>
  )
}
