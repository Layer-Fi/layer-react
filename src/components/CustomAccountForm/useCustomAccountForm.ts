import { useState } from 'react'
import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type CustomAccount, CustomAccountClassification, type CustomAccountSubtype, getCustomAccountTypeFromSubtype } from '@schemas/customAccounts'
import { useCreateCustomAccount } from '@hooks/api/businesses/[business-id]/custom-accounts/useCreateCustomAccount'
import { useAppForm } from '@hooks/features/forms/useForm'

type CustomAccountFormData = {
  account_name?: string
  institution_name?: string
  account_type?: CustomAccountSubtype
  custom_account_type: CustomAccountClassification
}

type UseCustomAccountFormProps = {
  onSuccess?: (account: CustomAccount) => void
}

export const useCustomAccountForm = ({ onSuccess }: UseCustomAccountFormProps) => {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)

  const { trigger: createCustomAccount } = useCreateCustomAccount()

  const form = useAppForm<CustomAccountFormData>({
    defaultValues: {
      account_name: undefined,
      institution_name: undefined,
      account_type: undefined,
      custom_account_type: CustomAccountClassification.PERSONAL,
    },
    onSubmit: async ({ value }) => {
      try {
        if (value.account_name && value.institution_name && value.account_type) {
          const account = await createCustomAccount({
            account_name: value.account_name.trim(),
            institution_name: value.institution_name.trim(),
            account_type: getCustomAccountTypeFromSubtype(value.account_type),
            account_subtype: value.account_type,
            custom_account_type: value.custom_account_type,
            external_id: null,
            mask: null,
            user_created: true,
          })
          setSubmitError(undefined)
          onSuccess?.(account)
        }
      }
      catch {
        setSubmitError(t('common:error.something_went_wrong_please_try_again', 'Something went wrong. Please try again.'))
      }
    },
  })

  const isFormValid = useStore(form.store, state => state.isValid)
  const isSubmitting = useStore(form.store, state => state.isSubmitting)

  return { form, submitError, isFormValid, isSubmitting }
}
