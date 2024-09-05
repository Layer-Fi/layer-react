import { useEffect, useState } from 'react'
import { Layer } from '../../api/layer'
import { NORMALITY_OPTIONS } from '../../components/ChartOfAccountsForm/constants'
import { useLayerContext } from '../../contexts/LayerContext'
import { FormError, DateRange, Direction, NewAccount } from '../../types'
import {
  ChartWithBalances,
  EditAccount,
  LedgerAccountBalance,
} from '../../types/chart_of_accounts'
import { BaseSelectOption, DataModel } from '../../types/general'
import { endOfMonth, formatISO, startOfMonth } from 'date-fns'
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

type Props = {
  startDate?: Date
  endDate?: Date
  withDates?: boolean
}

export const flattenAccounts = (
  accounts: LedgerAccountBalance[],
): LedgerAccountBalance[] =>
  accounts
    .flatMap(a => [a, flattenAccounts(a.sub_accounts || [])])
    .flat()
    .filter(id => id)

export const useChartOfAccounts = (
  { withDates, startDate: initialStartDate, endDate: initialEndDate }: Props = {
    withDates: false,
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
  },
) => {
  const {
    auth,
    businessId,
    apiUrl,
    touch,
    read,
    syncTimestamps,
    hasBeenTouched,
  } = useLayerContext()

  const [form, setForm] = useState<ChartOfAccountsForm | undefined>()
  const [sendingForm, setSendingForm] = useState(false)
  const [apiError, setApiError] = useState<string | undefined>(undefined)
  const [startDate, setStartDate] = useState(
    initialStartDate ?? startOfMonth(Date.now()),
  )
  const [endDate, setEndDate] = useState(
    initialEndDate ?? endOfMonth(Date.now()),
  )

  const queryKey =
    businessId &&
    auth?.access_token &&
    `chart-of-accounts-${businessId}-${startDate?.valueOf()}-${endDate?.valueOf()}`

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    queryKey,
    Layer.getLedgerAccountBalances(apiUrl, auth?.access_token, {
      params: {
        businessId,
        startDate:
          withDates && startDate ? formatISO(startDate.valueOf()) : undefined,
        endDate:
          withDates && endDate ? formatISO(endDate.valueOf()) : undefined,
      },
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
      touch(DataModel.CHART_OF_ACCOUNTS)
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
      touch(DataModel.CHART_OF_ACCOUNTS)
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

  const changeDateRange = ({
    startDate: newStartDate,
    endDate: newEndDate,
  }: Partial<DateRange>) => {
    newStartDate && setStartDate(newStartDate)
    newEndDate && setEndDate(newEndDate)
  }

  const refetch = () => mutate()

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (queryKey && (isLoading || isValidating)) {
      read(DataModel.CHART_OF_ACCOUNTS, queryKey)
    }
  }, [isLoading, isValidating])

  useEffect(() => {
    if (queryKey && hasBeenTouched(queryKey)) {
      refetch()
    }
  }, [syncTimestamps, startDate, endDate])

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
    dateRange: { startDate, endDate },
    changeDateRange,
  }
}
