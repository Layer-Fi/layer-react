import { useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'

import { type TaxProfile, TaxProfileRequestSchema } from '@schemas/taxEstimates/profile'
import { UpsertTaxProfileMode, useUpsertTaxProfile } from '@hooks/taxEstimates/useUpsertTaxProfile'
import { formValuesToTaxProfile, taxProfileToFormValues } from '@components/TaxProfileForm/formUtils'
import { type TaxProfileForm } from '@components/TaxProfileForm/taxProfileFormSchema'
import { useAppForm } from '@features/forms/hooks/useForm'

type UseTaxProfileFormProps = {
  taxProfile?: TaxProfile | null
  onSuccess?: (profile: TaxProfile) => void
}

export const useTaxProfileForm = ({ taxProfile, onSuccess }: UseTaxProfileFormProps) => {
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const [submitSuccess, setSubmitSuccess] = useState<string | undefined>(undefined)

  const isNewProfile = !taxProfile?.usConfiguration

  const mode = isNewProfile ? UpsertTaxProfileMode.Create : UpsertTaxProfileMode.Update
  const { trigger: upsertProfile } = useUpsertTaxProfile({ mode })

  const formDefaults = useMemo(() => taxProfileToFormValues(taxProfile), [taxProfile])

  const defaultValuesRef = useRef<TaxProfileForm>(formDefaults)
  const defaultValues = defaultValuesRef.current

  const form = useAppForm<TaxProfileForm>({
    defaultValues,
    onSubmit: async ({ value }) => {
      try {
        const taxProfileValue = formValuesToTaxProfile(value)
        const input = Schema.encodeSync(TaxProfileRequestSchema)(taxProfileValue)
        const result = await upsertProfile(input)

        setSubmitError(undefined)
        setSubmitSuccess('Tax profile saved')
        form.reset(value, { keepDefaultValues: false })
        onSuccess?.(result.data)
      }
      catch (e) {
        console.error(e)
        setSubmitSuccess(undefined)
        setSubmitError('Something went wrong. Please try again.')
      }
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'submit',
    }),
    canSubmitWhenInvalid: true,
  })

  return useMemo(() => ({
    form,
    submitError,
    submitSuccess,
  }), [form, submitError, submitSuccess])
}
