import { useMemo, useState } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import type { EditAccount, NewAccount } from '@internal-types/chartOfAccounts'
import type { Direction } from '@internal-types/general'
import { type FormError } from '@internal-types/general'
import { type BaseSelectOption } from '@internal-types/general'
import type { SingleChartAccountEncodedType } from '@schemas/generalLedger/ledgerAccount'
import { type NestedLedgerAccountType } from '@schemas/generalLedger/ledgerAccount'
import { post, put } from '@utils/api/authenticatedHttp'
import { useDeleteAccountFromLedger } from '@hooks/api/businesses/[business-id]/ledger/accounts/[account-id]/useDeleteLedgerAccount'
import { useLedgerBalances, useLedgerBalancesCacheActions } from '@hooks/api/businesses/[business-id]/ledger/balances/useLedgerBalances'
import { useLedgerEntriesCacheActions } from '@hooks/api/businesses/[business-id]/ledger/entries/useListLedgerEntries'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { buildNormalityOptions } from '@components/ChartOfAccountsForm/useChartOfAccountsFormOptions'

const createAccount = post<{ data: SingleChartAccountEncodedType }, NewAccount>(
  ({ businessId }) => `/v1/businesses/${businessId}/ledger/accounts`,
)

const updateAccount = put<{ data: SingleChartAccountEncodedType }, EditAccount>(
  ({ businessId, accountId }) =>
    `/v1/businesses/${businessId}/ledger/accounts/${accountId}`,
)

const validate = (formData: ChartOfAccountsForm, t: TFunction): FormError[] => {
  const errors: FormError[] = []

  const parentIdError = validateParentId(formData, t)
  if (parentIdError) {
    errors.push(parentIdError)
  }
  const nameError = validateName(formData, t)
  if (nameError) {
    errors.push(nameError)
  }
  const normalityError = validateNormality(formData, t)
  if (normalityError) {
    errors.push(normalityError)
  }
  const typeError = validateType(formData, t)
  if (typeError) {
    errors.push(typeError)
  }
  const subTypeError = validateSubType(formData, t)
  if (subTypeError) {
    errors.push(subTypeError)
  }

  return errors
}

const revalidateField = (fieldName: string, formData: ChartOfAccountsForm, t: TFunction) => {
  switch (fieldName) {
    case 'parent': {
      const parentIdError = validateParentId(formData, t)
      if (parentIdError) {
        return (formData?.errors || [])
          .filter(x => x.field !== fieldName)
          .concat([parentIdError])
      }
      return (formData?.errors || []).filter(x => x.field !== fieldName)
    }
    case 'name': {
      const nameError = validateName(formData, t)
      if (nameError) {
        return (formData?.errors || [])
          .filter(x => x.field !== fieldName)
          .concat([nameError])
      }

      return (formData?.errors || []).filter(x => x.field !== fieldName)
    }
    case 'normality': {
      const normalityError = validateNormality(formData, t)
      if (normalityError) {
        return (formData?.errors || [])
          .filter(x => x.field !== fieldName)
          .concat([normalityError])
      }

      return (formData?.errors || []).filter(x => x.field !== fieldName)
    }
    case 'type': {
      const typeError = validateType(formData, t)
      if (typeError) {
        return (formData?.errors || [])
          .filter(x => x.field !== fieldName)
          .concat([typeError])
      }

      return (formData?.errors || []).filter(x => x.field !== fieldName)
    }
    case 'subType': {
      const subTypeError = validateSubType(formData, t)
      if (subTypeError) {
        return (formData?.errors || [])
          .filter(x => x.field !== fieldName)
          .concat([subTypeError])
      }

      return (formData?.errors || []).filter(x => x.field !== fieldName)
    }
    default:
      return formData?.errors
  }
}

const validateSubType = (formData: ChartOfAccountsForm, t: TFunction) => {
  if (!formData?.data.subType?.value) {
    return {
      field: 'subType',
      message: t('common.mustBeSelected', 'Must be selected'),
    }
  }

  return
}

const validateType = (formData: ChartOfAccountsForm, t: TFunction) => {
  if (!formData?.data.type?.value) {
    return {
      field: 'type',
      message: t('common.mustBeSelected', 'Must be selected'),
    }
  }

  return
}

const validateNormality = (formData: ChartOfAccountsForm, t: TFunction) => {
  const stringValueNormality = formData?.data.normality?.value?.toString()
  if (stringValueNormality === undefined) {
    return {
      field: 'normality',
      message: t('common.mustBeSelected', 'Must be selected'),
    }
  }
  else if (!['DEBIT', 'CREDIT'].includes(stringValueNormality)) {
    return {
      field: 'normality',
      message: t('common.mustBeSelected', 'Must be selected'),
    }
  }

  return
}

const validateParentId = (formData: ChartOfAccountsForm, t: TFunction) => {
  if (!formData?.data.parent?.value) {
    return {
      field: 'parent',
      message: t('common.mustBeSelected', 'Must be selected'),
    }
  }

  return
}

const validateName = (formData: ChartOfAccountsForm, t: TFunction) => {
  if (!formData?.data.name?.trim()) {
    return {
      field: 'name',
      message: t('common.cannotBeBlank', 'Cannot be blank'),
    }
  }

  return
}

export interface ChartOfAccountsForm {
  action: 'new' | 'edit'
  accountId?: string
  data: {
    parent?: BaseSelectOption
    stable_name?: string
    name?: string
    accountNumber?: string
    type?: BaseSelectOption
    subType?: BaseSelectOption
    normality?: BaseSelectOption
  }
  errors?: FormError[]
}

type Props = {
  startDate?: Date
  endDate?: Date
  withDates?: boolean
}

export const flattenAccounts = (
  accounts: readonly NestedLedgerAccountType[],
): NestedLedgerAccountType[] =>
  accounts
    .flatMap(a => [a, flattenAccounts(a.subAccounts || [])])
    .flat()
    .filter(id => id)

export const useChartOfAccounts = ({ withDates = false }: Props = {}) => {
  const { t } = useTranslation()
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()
  const { startDate, endDate } = useGlobalDateRange({ dateSelectionMode: 'month' })

  const [form, setForm] = useState<ChartOfAccountsForm | undefined>()
  const [sendingForm, setSendingForm] = useState(false)
  const [apiError, setApiError] = useState<string | undefined>(undefined)
  const { trigger: originalTrigger } = useDeleteAccountFromLedger()
  const { data, isLoading, isValidating, isError, mutate } = useLedgerBalances(withDates, startDate, endDate)
  const { invalidateLedgerBalances } = useLedgerBalancesCacheActions()
  const { forceReloadLedgerEntries } = useLedgerEntriesCacheActions()
  const normalityOptions = useMemo(() => buildNormalityOptions(t), [t])

  const create = async (newAccount: NewAccount) => {
    setSendingForm(true)
    setApiError(undefined)

    try {
      await createAccount(apiUrl, auth?.access_token, {
        params: { businessId },
        body: newAccount,
      })
      await refetch()
      setForm(undefined)
    }
    catch (_err) {
      setApiError(t('common.submitFailedPleaseCheckYourConnectionAndTryAgain', 'Submit failed. Please check your connection and try again.'))
    }
    finally {
      setSendingForm(false)
    }
  }

  const update = async (accountData: EditAccount, accountId: string) => {
    setSendingForm(true)
    setApiError(undefined)

    const newAccountData = {
      ...accountData,
    }

    try {
      await updateAccount(apiUrl, auth?.access_token, {
        params: { businessId, accountId },
        body: newAccountData,
      })
      await refetch()
      setForm(undefined)
    }
    catch (_err) {
      setApiError(t('common.submitFailedPleaseCheckYourConnectionAndTryAgain', 'Submit failed. Please check your connection and try again.'))
    }
    finally {
      setSendingForm(false)
    }
  }

  const submitForm = () => {
    if (!form || !form.action) {
      return
    }

    const errors = validate(form, t)

    if (errors.length > 0) {
      setForm({
        ...form,
        errors,
      })

      return
    }

    const data = {
      name: form.data.name ?? '',
      stable_name: form.data.stable_name
        ? {
          type: 'StableName' as const,
          stable_name: form.data.stable_name,
        }
        : undefined,
      parent_id: form.data.parent
        ? {
          type: 'AccountId' as const,
          id: form.data.parent.value as string,
        }
        : undefined,
      account_type: (form.data.type as BaseSelectOption).value.toString(),
      account_subtype: form.data.subType?.value.toString(),
      normality: form.data.normality?.value as Direction,
      account_number: form.data.accountNumber ?? undefined,
    }

    if (form.action === 'new') {
      void create(data)
      return
    }

    if (form.action === 'edit' && form.accountId) {
      void update(data, form.accountId)
      return
    }
  }

  const addAccount = () =>
    setForm({
      action: 'new',
      accountId: undefined,
      data: {
        parent: undefined,
        name: undefined,
        type: undefined,
        normality: undefined,
        subType: undefined,
      },
    })

  const deleteAccount = async (accountId: string) => {
    try {
      await originalTrigger({ accountId })
    }
    catch (_err) {
      throw new Error('This account could not be deleted. Please check your connection and try again.')
    }
    try {
      await refetch()
    }
    catch (_err) {
      throw new Error('Refetch failed. Please check your connection and try again.')
    }
  }

  const editAccount = (id: string) => {
    const allAccounts = flattenAccounts(data?.accounts || [])
    const found = allAccounts?.find(x => x.accountId === id)

    if (!found) {
      return
    }

    const parent = allAccounts.find(x =>
      x.subAccounts?.find(el => el.accountId === found.accountId),
    )

    setForm({
      action: 'edit',
      accountId: id,
      data: {
        parent: parent
          ? {
            value: parent.accountId,
            label: parent.name,
          }
          : undefined,
        stable_name: found.stableName ?? undefined,
        name: found.name,
        type: {
          value: found.accountType.value,
          label: found.accountType.displayName,
        },
        accountNumber: found.accountNumber ?? undefined,
        subType: found.accountSubtype
          ? {
            value: found.accountSubtype?.value,
            label: found.accountSubtype?.displayName,
          }
          : undefined,
        normality: normalityOptions.find(
          normalityOption => normalityOption.value == found.normality,
        ),
      },
    })
  }

  const cancelForm = () => setForm(undefined)

  const changeFormData = (
    fieldName: string,
    value: string | BaseSelectOption | undefined,
  ) => {
    if (!form) {
      return
    }

    let newFormData = {
      ...form,
      data: {
        ...form.data,
        [fieldName]: value,
      },
    }

    /* When setting the parent field, automatically inherit the parent's type & normality fields */
    if (fieldName === 'parent') {
      const allAccounts = flattenAccounts(data?.accounts || [])
      const foundParent = allAccounts?.find(
        x => x.accountId === (value as BaseSelectOption).value,
      )
      if (foundParent) {
        newFormData = {
          ...newFormData,
          data: {
            ...newFormData.data,
            /* Inherit the parent's type */
            type: {
              value: foundParent.accountType.value,
              label: foundParent.accountType.displayName,
            },

            /* If the parent has a subtype, inherit it */
            subType: foundParent.accountSubtype
              ? {
                value: foundParent.accountSubtype?.value,
                label: foundParent.accountSubtype?.displayName,
              }
              : undefined,

            /* Inherit the parent's normality */
            normality: normalityOptions.find(
              normalityOption => normalityOption.value == foundParent.normality,
            ),
          },
        }
      }
    }

    const errors = revalidateField(fieldName, newFormData, t)

    setForm({
      ...newFormData,
      errors,
    })
  }
  const refetch = async () => {
    void invalidateLedgerBalances()
    void forceReloadLedgerEntries()
    await mutate()
  }

  return {
    data,
    isLoading,
    isValidating,
    isError,
    refetch,
    create,
    form,
    sendingForm,
    apiError,
    addAccount,
    editAccount,
    deleteAccount,
    cancelForm,
    changeFormData,
    submitForm,
  }
}
