import { useState } from 'react'
import { Layer } from '../../api/layer'
import { Account, Direction, ChartOfAccounts, NewAccount } from '../../types'
import { BaseSelectOption } from '../../types/general'
import { convertToStableName } from '../../utils/helpers'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

interface FormError {
  field: string
  message: string
}

const validate = (formData?: ChartOfAccountsForm) => {
  const errors: FormError[] = []

  const nameError = validateName(formData)
  if (nameError) {
    errors.push(nameError)
  }

  return errors
}

const revalidateField = (fieldName: string, formData?: ChartOfAccountsForm) => {
  switch (fieldName) {
    case 'name':
      const nameError = validateName(formData)
      if (nameError) {
        return (formData?.errors || [])
          .filter(x => x.field !== fieldName)
          .concat([nameError])
      }

      return (formData?.errors || []).filter(x => x.field !== fieldName)
    default:
      return formData?.errors
  }
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
    name?: string
    type?: BaseSelectOption
    subType?: BaseSelectOption
    category?: BaseSelectOption
  }
  errors?: FormError[]
}

type UseChartOfAccounts = () => {
  data: ChartOfAccounts | undefined
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

export const flattenAccounts = (accounts: Account[]): Account[] =>
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
    Layer.getChartOfAccounts(apiUrl, auth?.access_token, {
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

  const update = async (accountData: NewAccount, accountId: string) => {
    setSendingForm(true)
    setApiError(undefined)

    const stable_name = convertToStableName(accountData.name)

    /** @TODO some fields will be deprecated soon */
    const newAccountData = {
      ...accountData,
      stable_name: stable_name,
      pnl_category: 'INCOME', //this field will be deprecated soon, but is still required
      always_show_in_pnl: false, //this field will be deprecated soon, but is still required
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
      normality: form.data.subType?.value as Direction,
      parent_id: form.data.parent
        ? {
            type: 'AccountId' as 'AccountId',
            id: form.data.parent.value as string,
          }
        : undefined,
      description: form.data.type?.value.toString() ?? '',
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
        type: {
          value: 'assets',
          label: 'Assets',
        },
        subType: undefined,
        category: undefined,
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
        name: found.name,
        type: {
          value: 'assets',
          label: 'Assets',
        },
        subType: undefined,
        category: undefined,
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

    const newFormData = {
      ...form,
      data: {
        ...form.data,
        [fieldName]: value,
      },
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
