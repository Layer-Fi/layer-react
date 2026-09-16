import { useCallback, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import { type LedgerAccountForm } from '@schemas/features/generalLedger/ledgerAccountForm'
import { type NestedLedgerAccountType } from '@schemas/features/generalLedger/ledgerBalances'
import { UpsertLedgerAccountSchema } from '@schemas/features/generalLedger/upsertLedgerAccount'
import { UpsertMode } from '@hooks/utils/swr/createUpsertHook'
import { useUpsertLedgerAccount } from '@api/businesses/[business-id]/ledger/accounts/upsert'
import { useAppForm } from '@blocks/Form/useForm'
import {
  convertLedgerAccountFormToParams,
  getLedgerAccountFormDefaultValues,
  LedgerAccountInvalidReason,
  validateLedgerAccountForm,
} from '@features/generalLedger/ChartOfAccountsForm/formUtils'

type UseChartOfAccountsFormProps = {
  onSuccess: () => void
} & (
  | { mode: UpsertMode.Create }
  | { mode: UpsertMode.Update, account: NestedLedgerAccountType, parentAccountId?: string }
)

export const useChartOfAccountsForm = (props: UseChartOfAccountsFormProps) => {
  const { t } = useTranslation()
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, mode } = props

  const upsertProps = mode === UpsertMode.Update
    ? { mode: UpsertMode.Update as const, accountId: props.account.accountId }
    : { mode: UpsertMode.Create as const }
  const { trigger: upsertLedgerAccount } = useUpsertLedgerAccount(upsertProps)

  const stableName = mode === UpsertMode.Update ? props.account.stableName : undefined

  const defaultValuesRef = useRef<LedgerAccountForm>(
    getLedgerAccountFormDefaultValues(
      mode === UpsertMode.Update
        ? { account: props.account, parentAccountId: props.parentAccountId }
        : undefined,
    ),
  )
  const defaultValues = defaultValuesRef.current

  const onSubmit = useCallback(async ({ value }: { value: LedgerAccountForm }) => {
    try {
      const upsertLedgerAccountParams = convertLedgerAccountFormToParams(value, { stableName })
      const upsertLedgerAccountRequest = Schema.encodeUnknownSync(UpsertLedgerAccountSchema)(upsertLedgerAccountParams)

      await upsertLedgerAccount(upsertLedgerAccountRequest)

      setSubmitError(undefined)
      onSuccess()
    }
    catch (e) {
      console.error(e)
      setSubmitError(t('common:error.submit_failed_check_connection', 'Submit failed. Please check your connection and try again.'))
    }
  }, [onSuccess, upsertLedgerAccount, stableName, t])

  const getErrorText = useCallback((reason: LedgerAccountInvalidReason): string => {
    switch (reason) {
      case LedgerAccountInvalidReason.ParentRequired:
        return t('generalLedger:ChartOfAccountsForm.useChartOfAccountsForm.validation.parent_required', 'Select a parent account')
      case LedgerAccountInvalidReason.NameRequired:
        return t('generalLedger:ChartOfAccountsForm.useChartOfAccountsForm.validation.name_required', 'Enter an account name')
      case LedgerAccountInvalidReason.TypeRequired:
        return t('generalLedger:ChartOfAccountsForm.useChartOfAccountsForm.validation.type_required', 'Select an account type')
      case LedgerAccountInvalidReason.SubTypeRequired:
        return t('generalLedger:ChartOfAccountsForm.useChartOfAccountsForm.validation.subtype_required', 'Select a sub-type')
      case LedgerAccountInvalidReason.NormalityRequired:
        return t('generalLedger:ChartOfAccountsForm.useChartOfAccountsForm.validation.normality_required', 'Select a normality')
      default:
        return ''
    }
  }, [t])

  const onDynamic = useCallback(({ value }: { value: LedgerAccountForm }) => {
    const errors = validateLedgerAccountForm(value)
    if (!errors) return null

    const fields = errors.reduce<Record<string, string>>((acc, { field, reason }) => {
      acc[field] = getErrorText(reason)
      return acc
    }, {})

    return { fields }
  }, [getErrorText])

  const validators = useMemo(() => ({ onDynamic }), [onDynamic])

  const form = useAppForm<LedgerAccountForm>({
    defaultValues,
    onSubmit,
    validators,
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'submit',
    }),
    canSubmitWhenInvalid: true,
  })

  return useMemo(() => (
    { form, submitError }),
  [form, submitError])
}
