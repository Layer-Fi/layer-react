import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import type { CategorizationRule } from '@schemas/bankTransactions/categorizationRules/categorizationRule'
import { amountRangeInOrder } from '@utils/form/validators'
import { UpsertCategorizationRuleMode, useUpsertCategorizationRule } from '@hooks/api/businesses/[business-id]/categorization-rules/useUpsertCategorizationRule'
import { useAppForm } from '@hooks/features/forms/useForm'
import {
  type CategorizationRuleFormState,
  type CategorizationRuleFormValues,
  convertFormToCreateBody,
  convertFormToPatchBody,
  getCategorizationRuleFormDefaultValues,
} from '@components/CategorizationRules/CategorizationRuleForm/formUtils'

type UseCategorizationRuleFormProps = {
  formState: CategorizationRuleFormState
  onSuccess: (rule: CategorizationRule) => void
}

export const useCategorizationRuleForm = ({ formState, onSuccess }: UseCategorizationRuleFormProps) => {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { trigger: upsertCategorizationRule } = useUpsertCategorizationRule(
    formState.mode === 'edit'
      ? { mode: UpsertCategorizationRuleMode.Update, categorizationRuleId: formState.rule.id }
      : { mode: UpsertCategorizationRuleMode.Create },
  )

  const formDefaults = useMemo(
    () => getCategorizationRuleFormDefaultValues(formState),
    [formState],
  )

  const defaultValuesRef = useRef<CategorizationRuleFormValues>(formDefaults)
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: CategorizationRuleFormValues }) => {
    try {
      const result = formState.mode === 'edit'
        ? await upsertCategorizationRule(convertFormToPatchBody(value))
        : await upsertCategorizationRule(convertFormToCreateBody(value))

      setSubmitError(undefined)
      onSuccess(result)
    }
    catch (e) {
      console.error(e)
      setSubmitError(t('common:error.something_went_wrong_please_try_again', 'Something went wrong. Please try again.'))
    }
  }, [formState, upsertCategorizationRule, onSuccess, t])

  const form = useAppForm<CategorizationRuleFormValues>({
    defaultValues,
    onSubmit,
    validationLogic: revalidateLogic(),
    canSubmitWhenInvalid: true,
    validators: {
      onDynamic: ({ value }) => {
        const error = amountRangeInOrder(
          { min: value.amountMinFilter, max: value.amountMaxFilter },
          t(
            'categorizationRules:validation.amount_min_greater_than_max',
            'Minimum amount must be less than or equal to maximum amount.',
          ),
        )
        return error ? { fields: { amountMinFilter: error, amountMaxFilter: error } } : undefined
      },
    },
  })

  useEffect(() => {
    form.reset(formDefaults)
  }, [form, formDefaults])

  return useMemo(() => ({ form, submitError }), [form, submitError])
}
