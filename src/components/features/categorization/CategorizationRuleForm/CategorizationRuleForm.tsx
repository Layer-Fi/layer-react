import { useCallback, useMemo } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { type CategorizationRule } from '@schemas/features/categorization/categorizationRule'
import { BankDirectionFilter } from '@schemas/features/categorization/categorizationRuleFilters'
import { isClassificationAccountIdentifier } from '@schemas/features/categorization/classification'
import { required } from '@utils/shared/form/validators'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { SubmitButton } from '@ui/Button/SubmitButton'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { FieldErrors } from '@blocks/Form/FieldErrors'
import { CategorySelect } from '@features/categorization/CategorizationRuleForm/CategorySelect'
import { CounterpartySelect } from '@features/categorization/CategorizationRuleForm/CounterpartySelect'
import { type CategorizationRuleFormState, type DirectionFormValue, getRuleTransactionDescription } from '@features/categorization/CategorizationRuleForm/formUtils'
import { useCategorizationRuleForm } from '@features/categorization/CategorizationRuleForm/useCategorizationRuleForm'

import './categorizationRuleForm.scss'

export type CategorizationRuleFormProps = {
  formState: CategorizationRuleFormState
  onSuccess: (rule: CategorizationRule) => void
}

export const CategorizationRuleForm = ({ formState, onSuccess }: CategorizationRuleFormProps) => {
  const { t } = useTranslation()
  const { form, submitError } = useCategorizationRuleForm({ formState, onSuccess })
  const { formatCurrencyFromCents } = useIntlFormatter()
  const transactionDescription = getRuleTransactionDescription(formState)

  const blockNativeOnSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const directionOptions = useMemo<Array<{ value: DirectionFormValue, label: string }>>(() => [
    { value: '', label: t('categorization:CategorizationRuleForm.label.any', 'Any') },
    { value: BankDirectionFilter.MONEY_IN, label: t('common:label.money_in', 'Money in') },
    { value: BankDirectionFilter.MONEY_OUT, label: t('common:label.money_out', 'Money out') },
  ], [t])

  return (
    <Form className='Layer__CategorizationRuleForm' onSubmit={blockNativeOnSubmit}>
      <form.Field
        name='counterparty'
        validators={{
          onDynamic: ({ value }) => transactionDescription
            ? undefined
            : required(
              t('categorization:CategorizationRuleForm.validation.counterparty_required', 'Counterparty is required.'),
            )(value),
        }}
      >
        {field => (
          <VStack gap='3xs'>
            <CounterpartySelect
              label={t('common:label.counterparty', 'Counterparty')}
              value={field.state.value}
              onValueChange={field.handleChange}
              placeholder={t('categorization:CategorizationRuleForm.placeholder.select_counterparty', 'Select counterparty')}
              transactionDescription={transactionDescription}
              showLabel
            />
            <FieldErrors errors={field.state.meta.errors} />
          </VStack>
        )}
      </form.Field>

      <form.Field
        name='category'
        validators={{
          onDynamic: ({ value }) => value && isClassificationAccountIdentifier(value)
            ? undefined
            : t('categorization:CategorizationRuleForm.validation.category_required', 'Category is required.'),
        }}
      >
        {field => (
          <VStack gap='3xs'>
            <CategorySelect
              label={t('common:label.category', 'Category')}
              value={field.state.value}
              onValueChange={field.handleChange}
              showLabel
              placeholder={t('categorization:CategorizationRuleForm.placeholder.select_account', 'Select account')}
            />
            <FieldErrors errors={field.state.meta.errors} />
          </VStack>
        )}
      </form.Field>

      <form.AppField name='bankDirectionFilter'>
        {field => (
          <field.FormRadioGroupField
            label={t('common:label.direction', 'Direction')}
            orientation='vertical'
            options={directionOptions}
          />
        )}
      </form.AppField>

      <VStack gap='3xs'>
        <HStack gap='md' className='Layer__CategorizationRuleForm__AmountRow'>
          <form.AppField name='amountMinFilter'>
            {field => (
              <field.FormNonRecursiveBigDecimalField
                label={t('categorization:CategorizationRuleForm.label.amount_min_optional', 'Minimum amount (optional)')}
                mode='currency'
                allowEmpty
                showFieldError={false}
                placeholder={formatCurrencyFromCents(0)}
              />
            )}
          </form.AppField>
          <form.AppField name='amountMaxFilter'>
            {field => (
              <field.FormNonRecursiveBigDecimalField
                label={t('categorization:CategorizationRuleForm.label.amount_max_optional', 'Maximum amount (optional)')}
                mode='currency'
                allowEmpty
                showFieldError={false}
                placeholder={t('categorization:CategorizationRuleForm.placeholder.none', 'None')}
              />
            )}
          </form.AppField>
        </HStack>
        <form.Subscribe selector={state => state.fieldMeta.amountMinFilter?.errors}>
          {errors => <FieldErrors errors={errors ?? []} />}
        </form.Subscribe>
      </VStack>

      <VStack justify='end' className='Layer__CategorizationRuleForm__Submit'>
        <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <SubmitButton
              type='submit'
              onPress={() => { void form.handleSubmit() }}
              isDisabled={!canSubmit}
              isPending={isSubmitting}
              isError={!!submitError}
              errorMessage={submitError}
              withRetry
            >
              {submitError
                ? t('common:action.retry_label', 'Retry')
                : formState.mode === 'edit'
                  ? t('categorization:CategorizationRuleForm.action.save_rule', 'Save Rule')
                  : t('categorization:CategorizationRuleForm.action.create_rule', 'Create Rule')}
            </SubmitButton>
          )}
        </form.Subscribe>
      </VStack>
    </Form>
  )
}
