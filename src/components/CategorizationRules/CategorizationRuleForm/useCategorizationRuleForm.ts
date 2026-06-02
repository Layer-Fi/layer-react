import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { useUpsertCategorizationRule } from '@hooks/api/businesses/[business-id]/categorization-rules/useUpsertCategorizationRule'
import { useAppForm } from '@hooks/features/forms/useForm'
import {
  type CategorizationRuleFormState,
  type CategorizationRuleFormValues,
  convertFormToCreateBody,
  convertFormToPatchBody,
  getCategorizationRuleFormDefaultValues,
  validateCategorizationRuleForm,
} from '@components/CategorizationRules/CategorizationRuleForm/formUtils'

type UseCategorizationRuleFormProps = {
  formState: CategorizationRuleFormState
  onSuccess: (rule: CategorizationRule) => void
}

export const useCategorizationRuleForm = ({ formState, onSuccess }: UseCategorizationRuleFormProps) => {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { trigger: upsertCategorizationRule } = useUpsertCategorizationRule()

  const formDefaults = useMemo(
    () => getCategorizationRuleFormDefaultValues(formState),
    [formState],
  )

  const defaultValuesRef = useRef<CategorizationRuleFormValues>(formDefaults)
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: CategorizationRuleFormValues }) => {
    try {
      const result = formState.mode === 'edit'
        ? await upsertCategorizationRule({
          mode: 'update',
          categorizationRuleId: formState.rule.id,
          body: convertFormToPatchBody(value),
        })
        : await upsertCategorizationRule({
          mode: 'create',
          body: convertFormToCreateBody(value),
        })

      setSubmitError(undefined)
      onSuccess(result.data)
    }
    catch (e) {
      console.error(e)
      setSubmitError(t('common:error.something_went_wrong_please_try_again', 'Something went wrong. Please try again.'))
    }
  }, [formState, upsertCategorizationRule, onSuccess, t])

  const onDynamic = useCallback(({ value }: { value: CategorizationRuleFormValues }) => {
    return validateCategorizationRuleForm(value, t)
  }, [t])

  const validators = useMemo(() => ({ onDynamic }), [onDynamic])

  const form = useAppForm<CategorizationRuleFormValues>({
    defaultValues,
    onSubmit,
    validators,
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'submit',
    }),
    canSubmitWhenInvalid: true,
  })

  useEffect(() => {
    form.reset(formDefaults)
  }, [form, formDefaults])

  return useMemo(() => ({ form, submitError }), [form, submitError])
}
