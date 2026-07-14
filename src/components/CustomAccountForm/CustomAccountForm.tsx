import { useEffect, useId, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type CustomAccount, CustomAccountClassification, CustomAccountSubtype } from '@schemas/customAccounts'
import { notEmpty } from '@utils/form'
import { translationKey } from '@utils/i18n/translationKey'
import { Button } from '@ui/Button/Button'
import { SubmitButton } from '@ui/Button/SubmitButton'
import { ComboBox } from '@ui/ComboBox/ComboBox'
import { HStack, Spacer, VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { useCustomAccountForm } from '@components/CustomAccountForm/useCustomAccountForm'
import { type RadioOption } from '@components/forms/FormRadioGroupField'
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
  const { form, submitError, isFormValid, isSubmitting } = useCustomAccountForm({ onSuccess })
  const accountTypeInputId = useId()

  const accountTypeOptions = useMemo(
    () => accountTypeConfig.map(opt => ({
      value: opt.value,
      label: t(opt.i18nKey, opt.defaultValue),
    })),
    [t],
  )

  const ownershipOptions = useMemo<RadioOption<CustomAccountClassification>[]>(
    () => [
      { value: CustomAccountClassification.PERSONAL, label: t('common:label.personal', 'Personal') },
      { value: CustomAccountClassification.DEFAULT, label: t('common:label.business', 'Business') },
    ],
    [t],
  )

  useEffect(() => {
    form.setFieldValue('account_name', initialAccountName)
  }, [form, initialAccountName])

  return (
    <div className='Layer__form Layer__custom-account-form'>
      <VStack gap='xs'>
        <form.AppField name='custom_account_type'>
          {field => (
            <field.FormRadioGroupField
              label={t('generalLedger:label.account_ownership', 'Ownership')}
              orientation='horizontal'
              options={ownershipOptions}
              className='Layer__custom-account-form__field'
            />
          )}
        </form.AppField>

        <form.AppField
          name='account_name'
          validators={{
            onSubmit: ({ value }) => notEmpty(value) ? undefined : t('generalLedger:validation.account_name_required', 'Account name is required'),
          }}
        >
          {field => (
            <field.FormTextField
              label={t('generalLedger:label.account_name', 'Account name')}
              placeholder={t('generalLedger:label.enter_account_name', 'Enter account name...')}
              className='Layer__custom-account-form__field'
            />
          )}
        </form.AppField>

        <form.AppField
          name='institution_name'
          validators={{
            onSubmit: ({ value }) => notEmpty(value) ? undefined : t('generalLedger:validation.institution_name_required', 'Institution name is required'),
          }}
        >
          {field => (
            <field.FormTextField
              label={t('generalLedger:label.institution_name', 'Institution name')}
              placeholder={t('generalLedger:label.enter_institution_name', 'Enter institution name...')}
              className='Layer__custom-account-form__field'
            />
          )}
        </form.AppField>

        <form.Field
          name='account_type'
          validators={{
            onSubmit: ({ value }) => notEmpty(value) ? undefined : t('generalLedger:validation.account_type_required', 'Account type is required'),
          }}
        >
          {field => (
            <VStack className='Layer__custom-account-form__field'>
              <Label size='sm' htmlFor={accountTypeInputId} pbe='3xs'>
                {t('generalLedger:label.account_type', 'Account type')}
              </Label>
              <ComboBox
                className='Layer__custom-account-form__input'
                inputId={accountTypeInputId}
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
            <Button type='button' variant='outlined' onPress={onCancel}>
              {t('common:action.cancel_label', 'Cancel')}
            </Button>
          )}
          <SubmitButton
            type='button'
            onPress={() => void form.handleSubmit()}
            isPending={isSubmitting && isFormValid}
            noIcon={!(isSubmitting && isFormValid)}
            withRetry
            isError={Boolean(submitError)}
            errorMessage={submitError ?? undefined}
          >
            {submitError
              ? t('common:action.retry_label', 'Retry')
              : t('generalLedger:action.save_account', 'Save Account')}
          </SubmitButton>
        </HStack>
      </VStack>
    </div>
  )
}
