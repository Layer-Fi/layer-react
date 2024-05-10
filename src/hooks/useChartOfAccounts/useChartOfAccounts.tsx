import { useState } from 'react'
import { Layer } from '../../api/layer'
import { NORMALITY_OPTIONS } from '../../components/ChartOfAccountsForm/constants'
import { Direction, FormError, NewAccount } from '../../types'
import {
  ChartWithBalances,
  EditAccount,
  LedgerAccountBalance,
} from '../../types/chart_of_accounts'
import { BaseSelectOption } from '../../types/general'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

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
  } else if (!['DEBIT', 'CREDIT'].includes(stringValueNormality)) {
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
    type?: BaseSelectOption
    subType?: BaseSelectOption
    normality?: BaseSelectOption
  }
  errors?: FormError[]
}

type UseChartOfAccounts = () => {
  data: ChartWithBalances | undefined
  isLoading?: boolean
  isValidating?: boolean
  error?: unknown
  refetch: () => void
  create: (newAccount: NewAccount) => void
  form?: ChartOfAccountsForm
  sendingForm?: boolean
  apiError?: string
  addAccount: () => void
  editAccount: (id: string) => void
  cancelForm: () => void
  changeFormData: (
    name: string,
    value: string | BaseSelectOption | undefined,
  ) => void
  submitForm: () => void
}

export const flattenAccounts = (
  accounts: LedgerAccountBalance[],
): LedgerAccountBalance[] =>
  accounts
    .flatMap(a => [a, flattenAccounts(a.sub_accounts || [])])
    .flat()
    .filter(id => id)

export const useChartOfAccounts: UseChartOfAccounts = () => {
  const { auth, businessId, apiUrl } = useLayerContext()

  const [form, setForm] = useState<ChartOfAccountsForm | undefined>()
  const [sendingForm, setSendingForm] = useState(false)
  const [apiError, setApiError] = useState<string | undefined>(undefined)

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    businessId && auth?.access_token && `chart-of-accounts-${businessId}`,
    Layer.getLedgerAccountBalances(apiUrl, auth?.access_token, {
      params: { businessId },
    }),
  )

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
    } catch (_err) {
      setApiError('Submit failed. Please, check your connection and try again.')
    } finally {
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
    } catch (_err) {
      setApiError('Submit failed. Please, check your connection and try again.')
    } finally {
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
      stable_name: form.data.stable_name,
      parent_id: form.data.parent
        ? {
            type: 'AccountId' as const,
            id: form.data.parent.value as string,
          }
        : undefined,
      account_type: (form.data.type as BaseSelectOption).value.toString(),
      account_subtype: form.data.subType?.value.toString(),
      normality: form.data.normality?.value as Direction,
    }

    if (form.action === 'new') {
      create(data)
      return
    }

    if (form.action === 'edit' && form.accountId) {
      update(data, form.accountId)
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

  const editAccount = (id: string) => {
    const allAccounts = flattenAccounts(data?.data?.accounts || [])
    const found = allAccounts?.find(x => x.id === id)

    if (!found) {
      return
    }

    const parent = allAccounts.find(
      x => x.sub_accounts?.find(el => el.id === found.id),
    )

    setForm({
      action: 'edit',
      accountId: id,
      data: {
        parent: parent
          ? {
              value: parent.id,
              label: parent.name,
            }
          : undefined,
        stable_name: found.stable_name,
        name: found.name,
        type: {
          value: found.account_type.value,
          label: found.account_type.display_name,
        },

        subType: found.account_subtype
          ? {
              value: found.account_subtype?.value,
              label: found.account_subtype?.display_name,
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
      const allAccounts = flattenAccounts(data?.data?.accounts || [])
      const foundParent = allAccounts?.find(
        x => x.id === (value as BaseSelectOption).value,
      )
      if (foundParent) {
        newFormData = {
          ...newFormData,
          data: {
            ...newFormData.data,
            /* Inherit the parent's type */
            type: {
              value: foundParent.account_type.value,
              label: foundParent.account_type.display_name,
            },

            /* If the parent has a subtype, inherit it */
            subType: foundParent.account_subtype
              ? {
                  value: foundParent.account_subtype?.value,
                  label: foundParent.account_subtype?.display_name,
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

  const refetch = () => mutate()

  return {
    data: data?.data,
    isLoading,
    isValidating,
    error,
    refetch,
    create,
    form,
    sendingForm,
    apiError,
    addAccount,
    editAccount,
    cancelForm,
    changeFormData,
    submitForm,
  }
}
