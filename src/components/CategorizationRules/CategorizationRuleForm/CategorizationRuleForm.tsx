import { useCallback, useMemo } from 'react'
import { AlertTriangle, Save } from 'lucide-react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'

import { BankDirectionFilter, type CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { CategoriesListMode } from '@schemas/categorization'
import { flattenValidationErrors } from '@utils/form'
import { Button } from '@ui/Button/Button'
import { Form } from '@ui/Form/Form'
import { HStack, VStack } from '@ui/Stack/Stack'
import { CounterpartySelect } from '@components/CategorizationRules/CategorizationRuleForm/CounterpartySelect'
import { type CategorizationRuleFormState, type DirectionFormValue } from '@components/CategorizationRules/CategorizationRuleForm/formUtils'
import { useCategorizationRuleForm } from '@components/CategorizationRules/CategorizationRuleForm/useCategorizationRuleForm'
import { DataState, DataStateStatus } from '@components/DataState/DataState'
import { LedgerAccountCombobox } from '@components/LedgerAccountCombobox/LedgerAccountCombobox'
import { TextSize } from '@components/Typography/Text'

import './categorizationRuleForm.scss'

export type CategorizationRuleFormProps = {
  formState: CategorizationRuleFormState
  onSuccess: (rule: CategorizationRule) => void
}

export const CategorizationRuleForm = ({ formState, onSuccess }: CategorizationRuleFormProps) => {
  const { t } = useTranslation()
  const { form, submitError } = useCategorizationRuleForm({ formState, onSuccess })

  const blockNativeOnSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const directionOptions = useMemo<Array<{ value: DirectionFormValue, label: string }>>(() => [
    { value: '', label: t('categorizationRules:label.any', 'Any') },
    { value: BankDirectionFilter.MONEY_IN, label: t('common:label.money_in', 'Money in') },
    { value: BankDirectionFilter.MONEY_OUT, label: t('common:label.money_out', 'Money out') },
  ], [t])

  return (
    <Form className='Layer__CategorizationRuleForm' onSubmit={blockNativeOnSubmit}>
      <form.Subscribe selector={state => state.errorMap}>
        {(errorMap) => {
          const validationErrors = flattenValidationErrors(errorMap)
          if (validationErrors.length > 0 || submitError) {
            return (
              <HStack className='Layer__CategorizationRuleForm__FormError'>
                <DataState
                  icon={<AlertTriangle size={16} />}
                  status={DataStateStatus.failed}
                  title={validationErrors[0] || submitError}
                  titleSize={TextSize.md}
                  inline
                />
              </HStack>
            )
          }
        }}
      </form.Subscribe>

      <form.Field name='counterparty'>
        {field => (
          <CounterpartySelect
            label={t('common:label.counterparty', 'Counterparty')}
            value={field.state.value}
            onValueChange={field.handleChange}
            placeholder={t('categorizationRules:placeholder.select_counterparty', 'Select counterparty')}
            showLabel
          />
        )}
      </form.Field>

      <form.Field name='category'>
        {field => (
          <LedgerAccountCombobox
            label={t('common:label.category', 'Category')}
            value={field.state.value}
            onValueChange={field.handleChange}
            mode={CategoriesListMode.All}
            showLabel
          />
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

      <HStack gap='md' className='Layer__CategorizationRuleForm__AmountRow'>
        <form.AppField name='amountMinFilter'>
          {field => (
            <field.FormNonRecursiveBigDecimalField
              label={t('categorizationRules:label.amount_min', 'Minimum amount')}
              mode='currency'
              allowEmpty
              placeholder={t('categorizationRules:placeholder.no_minimum', 'No minimum')}
            />
          )}
        </form.AppField>
        <form.AppField name='amountMaxFilter'>
          {field => (
            <field.FormNonRecursiveBigDecimalField
              label={t('categorizationRules:label.amount_max', 'Maximum amount')}
              mode='currency'
              allowEmpty
              placeholder={t('categorizationRules:placeholder.no_maximum', 'No maximum')}
            />
          )}
        </form.AppField>
      </HStack>

      <VStack justify='end' className='Layer__CategorizationRuleForm__Submit'>
        <form.Subscribe selector={state => [state.canSubmit, state.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type='submit'
              isDisabled={!canSubmit}
              isPending={isSubmitting}
              onPress={() => { void form.handleSubmit() }}
            >
              <Save size={14} />
              {formState.mode === 'edit'
                ? t('categorizationRules:action.save_rule', 'Save Rule')
                : t('categorizationRules:action.create_rule', 'Create Rule')}
            </Button>
          )}
        </form.Subscribe>
      </VStack>
    </Form>
  )
}
