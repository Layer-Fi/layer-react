import { useCallback, useMemo } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { BankDirectionFilter, type CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { isClassificationAccountIdentifier } from '@schemas/categorization'
import { amountRangeInOrder, required } from '@utils/form/validators'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { SubmitButton } from '@ui/Button/SubmitButton'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { CategorySelect } from '@components/CategorizationRules/CategorizationRuleForm/CategorySelect'
import { CounterpartySelect } from '@components/CategorizationRules/CategorizationRuleForm/CounterpartySelect'
import { type CategorizationRuleFormState, type DirectionFormValue } from '@components/CategorizationRules/CategorizationRuleForm/formUtils'
import { useCategorizationRuleForm } from '@components/CategorizationRules/CategorizationRuleForm/useCategorizationRuleForm'
import { FieldErrors } from '@components/forms/FieldErrors'

import './categorizationRuleForm.scss'

export type CategorizationRuleFormProps = {
  formState: CategorizationRuleFormState
  onSuccess: (rule: CategorizationRule) => void
}

export const CategorizationRuleForm = ({ formState, onSuccess }: CategorizationRuleFormProps) => {
  const { t } = useTranslation()
  const { form, submitError } = useCategorizationRuleForm({ formState, onSuccess })
  const { formatCurrencyFromCents } = useIntlFormatter()

  const blockNativeOnSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const amountRangeMessage = t(
    'categorizationRules:validation.amount_min_greater_than_max',
    'Minimum amount must be less than or equal to maximum amount.',
  )

  const directionOptions = useMemo<Array<{ value: DirectionFormValue, label: string }>>(() => [
    { value: '', label: t('categorizationRules:label.any', 'Any') },
    { value: BankDirectionFilter.MONEY_IN, label: t('common:label.money_in', 'Money in') },
    { value: BankDirectionFilter.MONEY_OUT, label: t('common:label.money_out', 'Money out') },
  ], [t])

  return (
    <Form className='Layer__CategorizationRuleForm' onSubmit={blockNativeOnSubmit}>
      <form.Field
        name='counterparty'
        validators={{
          onDynamic: ({ value }) => required(
            t('categorizationRules:validation.counterparty_required', 'Counterparty is required.'),
          )(value),
        }}
      >
        {field => (
          <VStack gap='3xs'>
            <CounterpartySelect
              label={t('common:label.counterparty', 'Counterparty')}
              value={field.state.value}
              onValueChange={field.handleChange}
              placeholder={t('categorizationRules:placeholder.select_counterparty', 'Select counterparty')}
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
            : t('categorizationRules:validation.category_required', 'Category is required.'),
        }}
      >
        {field => (
          <VStack gap='3xs'>
            <CategorySelect
              label={t('common:label.category', 'Category')}
              value={field.state.value}
              onValueChange={field.handleChange}
              showLabel
              placeholder={t('categorizationRules:placeholder.select_account', 'Select account')}
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
          <form.AppField
            name='amountMinFilter'
            validators={{
              onDynamic: ({ value, fieldApi }) => amountRangeInOrder(
                { min: value, max: fieldApi.form.state.values.amountMaxFilter },
                amountRangeMessage,
              ),
            }}
          >
            {field => (
              <field.FormNonRecursiveBigDecimalField
                label={t('categorizationRules:label.amount_min_optional', 'Minimum amount (optional)')}
                mode='currency'
                allowEmpty
                showFieldError={false}
                placeholder={formatCurrencyFromCents(0)}
              />
            )}
          </form.AppField>
          <form.AppField
            name='amountMaxFilter'
            validators={{
              onDynamic: ({ value, fieldApi }) => amountRangeInOrder(
                { min: fieldApi.form.state.values.amountMinFilter, max: value },
                amountRangeMessage,
              ),
            }}
          >
            {field => (
              <field.FormNonRecursiveBigDecimalField
                label={t('categorizationRules:label.amount_max_optional', 'Maximum amount (optional)')}
                mode='currency'
                allowEmpty
                showFieldError={false}
                placeholder={t('categorizationRules:placeholder.none', 'None')}
              />
            )}
          </form.AppField>
        </HStack>
        <form.Subscribe
          selector={state => state.submissionAttempts > 0
            && amountRangeInOrder(
              { min: state.values.amountMinFilter, max: state.values.amountMaxFilter },
              amountRangeMessage,
            )}
        >
          {error => <FieldErrors errors={error ? [error] : []} />}
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
                  ? t('categorizationRules:action.save_rule', 'Save Rule')
                  : t('categorizationRules:action.create_rule', 'Create Rule')}
            </SubmitButton>
          )}
        </form.Subscribe>
      </VStack>
    </Form>
  )
}
