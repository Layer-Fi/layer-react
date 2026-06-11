import { useCallback, useContext, useMemo, useRef, useState } from 'react'
import { revalidateLogic } from '@tanstack/react-form'
import { Schema } from 'effect'
import { useTranslation } from 'react-i18next'

import { type NestedLedgerAccountType } from '@schemas/generalLedger/ledgerAccount'
import { type LedgerAccountForm, UpsertLedgerAccountSchema } from '@schemas/generalLedger/upsertLedgerAccount'
import { UpsertLedgerAccountMode, useUpsertLedgerAccount } from '@hooks/api/businesses/[business-id]/ledger/accounts/useUpsertLedgerAccount'
import { useAppForm } from '@hooks/features/forms/useForm'
import { ChartOfAccountsContext } from '@contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import {
  convertLedgerAccountFormToParams,
  getLedgerAccountFormDefaultValues,
  LedgerAccountInvalidReason,
  validateLedgerAccountForm,
} from '@components/ChartOfAccountsForm/formUtils'

type UseChartOfAccountsFormProps = {
  onSuccess: () => void
} & (
  | { mode: UpsertLedgerAccountMode.Create }
  | { mode: UpsertLedgerAccountMode.Update, account: NestedLedgerAccountType, parentAccountId?: string }
)

export const useChartOfAccountsForm = (props: UseChartOfAccountsFormProps) => {
  const { t } = useTranslation()
  const { refetch } = useContext(ChartOfAccountsContext)
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const { onSuccess, mode } = props

  const upsertProps = mode === UpsertLedgerAccountMode.Update
    ? { mode: UpsertLedgerAccountMode.Update as const, accountId: props.account.accountId }
    : { mode: UpsertLedgerAccountMode.Create as const }
  const { trigger: upsertLedgerAccount } = useUpsertLedgerAccount(upsertProps)

  const stableName = mode === UpsertLedgerAccountMode.Update ? props.account.stableName : undefined

  const defaultValuesRef = useRef<LedgerAccountForm>(
    getLedgerAccountFormDefaultValues(
      mode === UpsertLedgerAccountMode.Update
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
      await refetch()

      setSubmitError(undefined)
      onSuccess()
    }
    catch (e) {
      console.error(e)
      setSubmitError(t('common:error.submit_failed_check_connection', 'Submit failed. Please check your connection and try again.'))
    }
  }, [onSuccess, upsertLedgerAccount, refetch, stableName, t])

  const getErrorText = useCallback((reason: LedgerAccountInvalidReason): string => {
    switch (reason) {
      case LedgerAccountInvalidReason.ParentRequired:
        return t('chartOfAccounts:validation.parent_required', 'Select a parent account')
      case LedgerAccountInvalidReason.NameRequired:
        return t('chartOfAccounts:validation.name_required', 'Enter an account name')
      case LedgerAccountInvalidReason.TypeRequired:
        return t('chartOfAccounts:validation.type_required', 'Select an account type')
      case LedgerAccountInvalidReason.SubTypeRequired:
        return t('chartOfAccounts:validation.subtype_required', 'Select a sub-type')
      case LedgerAccountInvalidReason.NormalityRequired:
        return t('chartOfAccounts:validation.normality_required', 'Select a normality')
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
