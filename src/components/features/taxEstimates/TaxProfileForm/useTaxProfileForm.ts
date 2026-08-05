import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import { type TaxProfile, TaxProfileRequestSchema } from '@schemas/features/taxEstimates/profile'
import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
import { useUpsertTaxProfile } from '@api/businesses/[business-id]/tax-estimates/profile/upsert'
import { useAppForm } from '@blocks/Form/useForm'
import { formValuesToTaxProfile, taxProfileToFormValues, validateTaxProfileForm } from '@features/taxEstimates/TaxProfileForm/formUtils'
import { type TaxProfileForm } from '@features/taxEstimates/TaxProfileForm/taxProfileFormSchema'

type UseTaxProfileFormProps = {
  taxProfile?: TaxProfile | null
  onSuccess?: (profile: TaxProfile) => void
}

export const useTaxProfileForm = ({ taxProfile, onSuccess }: UseTaxProfileFormProps) => {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const [submitSuccess, setSubmitSuccess] = useState<string | undefined>(undefined)

  const isNewProfile = !taxProfile?.userHasSavedTaxProfile

  const mode = isNewProfile ? UpsertMode.Create : UpsertMode.Update
  const { trigger: upsertProfile } = useUpsertTaxProfile({ mode })

  const formDefaults = useMemo(() => taxProfileToFormValues(taxProfile), [taxProfile])

  const defaultValuesRef = useRef<TaxProfileForm>(formDefaults)

  const validators = useMemo(() => ({
    onDynamic: (arg: { value: TaxProfileForm }) => validateTaxProfileForm(arg, t),
  }), [t])

  const onSubmit = useCallback(async ({ value }: { value: TaxProfileForm }) => {
    try {
      const taxProfileValue = formValuesToTaxProfile(value)
      const input = Schema.encodeSync(TaxProfileRequestSchema)(taxProfileValue)
      const result = await upsertProfile(input)

      setSubmitError(undefined)
      setSubmitSuccess(t('taxEstimates:TaxProfileForm.label.tax_profile_saved', 'Tax profile saved'))
      onSuccess?.(result)
    }
    catch (e) {
      console.error(e)
      setSubmitSuccess(undefined)
      setSubmitError(t('common:error.something_went_wrong_please_try_again', 'Something went wrong. Please try again.'))
    }
  }, [onSuccess, upsertProfile, t])

  const form = useAppForm<TaxProfileForm>({
    defaultValues: defaultValuesRef.current,
    onSubmit,
    validators,
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'submit',
    }),
    canSubmitWhenInvalid: true,
  })

  // Update the default values for the form when the tax profile changes
  useEffect(() => {
    if (formDefaults !== defaultValuesRef.current) {
      defaultValuesRef.current = formDefaults
      form.reset(formDefaults)
    }
  }, [form, formDefaults])

  return useMemo(() => ({
    form,
    submitError,
    submitSuccess,
  }), [form, submitError, submitSuccess])
}
