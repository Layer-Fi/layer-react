import { useState } from 'react'
import { useStore } from '@tanstack/react-form'
import { useTranslation } from 'react-i18next'

import { type CustomAccount, CustomAccountSubtype, CustomAccountType } from '@internal-types/customAccounts'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { useCreateCustomAccount } from '@hooks/api/businesses/[business-id]/custom-accounts/useCreateCustomAccount'
import { useForm } from '@hooks/features/forms/useForm'

export const getCustomAccountTypeFromSubtype = (subtype: CustomAccountSubtype): CustomAccountType => {
  switch (subtype) {
    case CustomAccountSubtype.CHECKING:
    case CustomAccountSubtype.SAVINGS:
      return CustomAccountType.DEPOSITORY
    case CustomAccountSubtype.CREDIT_CARD:
      return CustomAccountType.CREDIT
    default:
      unsafeAssertUnreachable({
        value: subtype,
        message: 'Unexpected custom account subtype',
      })
  }
}
type CustomAccountFormData = {
  account_name?: string
  institution_name?: string
  account_type?: CustomAccountSubtype
}

type UseCustomAccountFormProps = {
  onSuccess?: (account: CustomAccount) => void
}

export const useCustomAccountForm = ({ onSuccess }: UseCustomAccountFormProps) => {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)

  const { trigger: createCustomAccount } = useCreateCustomAccount()

  const form = useForm<CustomAccountFormData>({
    defaultValues: {
      account_name: undefined,
      institution_name: undefined,
      account_type: undefined,
    },
    onSubmit: async ({ value }) => {
      try {
        if (value.account_name && value.institution_name && value.account_type) {
          const account = await createCustomAccount({
            account_name: value.account_name.trim(),
            institution_name: value.institution_name.trim(),
            account_type: getCustomAccountTypeFromSubtype(value.account_type),
            account_subtype: value.account_type,
            external_id: null,
            mask: null,
            user_created: true,
          })
          setSubmitError(undefined)
          onSuccess?.(account)
        }
      }
      catch {
        setSubmitError(t('common.somethingWentWrongPleaseTryAgain', 'Something went wrong. Please try again.'))
      }
    },
  })

  const isFormValid = useStore(form.store, state => state.isValid)

  return { form, submitError, isFormValid }
}
