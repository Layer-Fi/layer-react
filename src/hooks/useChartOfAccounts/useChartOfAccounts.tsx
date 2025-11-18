import { useState } from 'react'

import {
  type EditAccount,
  type NewAccount,
} from '@internal-types/chart_of_accounts'
import type { Direction } from '@internal-types/general'
import { type FormError } from '@internal-types/general'
import { type BaseSelectOption } from '@internal-types/general'
import { type NestedLedgerAccountType } from '@schemas/generalLedger/ledgerAccount'
import { Layer } from '@api/layer'
import { useAuth } from '@hooks/useAuth'
import { useLedgerBalances, useLedgerBalancesCacheActions } from '@hooks/useLedgerBalances/useLedgerBalances'
import { useEnvironment } from '@providers/Environment/EnvironmentInputProvider'
import { useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { NORMALITY_OPTIONS } from '@components/ChartOfAccountsForm/constants'
import { useDeleteAccountFromLedger } from '@features/ledger/accounts/[ledgerAccountId]/api/useDeleteLedgerAccount'
import { useLedgerEntriesCacheActions } from '@features/ledger/entries/api/useListLedgerEntries'

const validate = (formData?: ChartOfAccountsForm) => {
  const errors: FormError[] = []

  const nameError = validateName(formData)
  if (nameError) {
    errors.push(nameError)
  }
  const normalityError = validateNormality(formData)
  if (normalityError) {
    errors.push(normalityError)
  }
  const typeError = validateType(formData)
  if (typeError) {
    errors.push(typeError)
  }

  return errors
}

const revalidateField = (fieldName: string, formData?: ChartOfAccountsForm) => {
  switch (fieldName) {
    case 'name': {
      const nameError = validateName(formData)
      if (nameError) {
        return (formData?.errors || [])
          .filter(x => x.field !== fieldName)
          .concat([nameError])
      }

      return (formData?.errors || []).filter(x => x.field !== fieldName)
    }
    case 'normality': {
      const normalityError = validateNormality(formData)
      if (normalityError) {
        return (formData?.errors || [])
          .filter(x => x.field !== fieldName)
          .concat([normalityError])
      }

      return (formData?.errors || []).filter(x => x.field !== fieldName)
    }
    case 'type': {
      const typeError = validateType(formData)
      if (typeError) {
        return (formData?.errors || [])
          .filter(x => x.field !== fieldName)
          .concat([typeError])
      }

      return (formData?.errors || []).filter(x => x.field !== fieldName)
    }
    default:
      return formData?.errors
  }
}

const validateType = (formData?: ChartOfAccountsForm) => {
  if (!formData?.data.type?.value) {
    return {
      field: 'type',
      message: 'Must be selected',
    }
  }

  return
}

const validateNormality = (formData?: ChartOfAccountsForm) => {
  const stringValueNormality = formData?.data.normality?.value?.toString()
  if (stringValueNormality === undefined) {
    return {
      field: 'normality',
      message: 'Must be selected',
    }
  }
  else if (!['DEBIT', 'CREDIT'].includes(stringValueNormality)) {
    return {
      field: 'normality',
      message: 'Must be selected',
    }
  }

  return
}

const validateName = (formData?: ChartOfAccountsForm) => {
  if (!formData?.data.name?.trim()) {
    return {
      field: 'name',
      message: 'Cannot be blank',
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
  const { businessId } = useLayerContext()
  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()
  const { startDate, endDate } = useGlobalDateRange({ displayMode: 'month' })

  const [form, setForm] = useState<ChartOfAccountsForm | undefined>()
  const [sendingForm, setSendingForm] = useState(false)
  const [apiError, setApiError] = useState<string | undefined>(undefined)
  const { trigger: originalTrigger } = useDeleteAccountFromLedger()
  const { data, isLoading, isValidating, isError, mutate } = useLedgerBalances(withDates, startDate, endDate)
  const { invalidateLedgerBalances } = useLedgerBalancesCacheActions()
  const { forceReloadLedgerEntries } = useLedgerEntriesCacheActions()

  const create = async (newAccount: NewAccount) => {
    setSendingForm(true)
    setApiError(undefined)

    try {
      await Layer.createAccount(apiUrl, auth?.access_token, {
        params: { businessId },
        body: newAccount,
      })
      await refetch()
      setForm(undefined)
    }
    catch (_err) {
      setApiError('Submit failed. Please, check your connection and try again.')
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
      await Layer.updateAccount(apiUrl, auth?.access_token, {
        params: { businessId, accountId },
        body: newAccountData,
      })
      await refetch()
      setForm(undefined)
    }
    catch (_err) {
      setApiError('Submit failed. Please, check your connection and try again.')
    }
    finally {
      setSendingForm(false)
    }
  }

  const submitForm = () => {
    if (!form || !form.action) {
      return
    }

    const errors = validate(form)

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
        normality: NORMALITY_OPTIONS.find(
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
            normality: NORMALITY_OPTIONS.find(
              normalityOption => normalityOption.value == foundParent.normality,
            ),
          },
        }
      }
    }

    const errors = revalidateField(fieldName, newFormData)

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
