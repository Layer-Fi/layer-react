import { useTranslation } from 'react-i18next'

import { type CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { SubmitButton } from '@ui/Button/SubmitButton'
import { VStack } from '@ui/Stack/Stack'
import { CategorizationRuleFormFields } from '@components/CategorizationRules/CategorizationRuleForm/CategorizationRuleFormFields'
import { type CategorizationRuleFormState } from '@components/CategorizationRules/CategorizationRuleForm/formUtils'
import { useCategorizationRuleForm } from '@components/CategorizationRules/CategorizationRuleForm/useCategorizationRuleForm'

import './categorizationRuleForm.scss'

export type CategorizationRuleFormProps = {
  formState: CategorizationRuleFormState
  onSuccess: (rule: CategorizationRule) => void
}

export const CategorizationRuleForm = ({ formState, onSuccess }: CategorizationRuleFormProps) => {
  const { t } = useTranslation()
  const { form, submitError } = useCategorizationRuleForm({ formState, onSuccess })

  return (
    <CategorizationRuleFormFields form={form} formState={formState}>
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
    </CategorizationRuleFormFields>
  )
}
