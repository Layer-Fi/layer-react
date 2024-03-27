import { useState } from 'react'
import { Layer } from '../../api/layer'
import {
  AccountAlternate,
  Direction,
  LedgerAccounts,
  NewAccount,
} from '../../types'
import { BaseSelectOption } from '../../types/general'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

export interface LedgerAccountsForm {
  action: 'new' | 'edit'
  accountId?: string
  data: {
    parent?: BaseSelectOption
    name?: string
    type?: BaseSelectOption
    subType?: BaseSelectOption
    category?: BaseSelectOption
  }
}

type UseLedgerAccounts = () => {
  data: LedgerAccounts | undefined
  isLoading?: boolean
  error?: unknown
  create: (newAccount: NewAccount) => void
  form?: LedgerAccountsForm
  addAccount: () => void
  editAccount: (id: string) => void
  cancelForm: () => void
  changeFormData: (
    name: string,
    value: string | BaseSelectOption | undefined,
  ) => void
  submitForm: () => void
  showARForAccountId?: string
  setShowARForAccountId: (id: string) => void
}

export const useLedgerAccounts: UseLedgerAccounts = () => {
  const { auth, businessId, apiUrl } = useLayerContext()

  const [form, setForm] = useState<LedgerAccountsForm | undefined>()
  const [showARForAccountId, setShowARForAccountId] = useState<
    string | undefined
  >()

  const { data, isLoading, error, mutate } = useSWR(
    businessId && auth?.access_token && `ledger-accounts-${businessId}`,
    Layer.getLedgerAccounts(apiUrl, auth?.access_token, {
      params: { businessId },
    }),
  )

  const create = (newAccount: NewAccount) => {
    Layer.createAccount(apiUrl, auth?.access_token, {
      params: { businessId },
      body: newAccount,
    }).then(({ data }) => (mutate(), data))
  }

  const submitForm = () => {
    console.log('save...')

    if (!form || !form.action) {
      return
    }

    const data = {
      name: form.data.name || 'Test name',
      normality: form.data.subType?.value as Direction,
      parent_id: form.data.parent
        ? {
            type: 'AccountId' as 'AccountId',
            id: form.data.parent.value as string,
          }
        : undefined,
      description: form.data.type?.value.toString() || 'Test description',
    }

    if (form.action === 'new') {
      // @TODO add validation - no empty name
      console.log('new')
      create(data)
      return
    }

    if (form.action === 'edit' && form.accountId) {
      console.log('edit')
      // @TODO call update - missing endpoint?
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
    console.log('edit account', id)
    // @TODO find in data AND sub_accounts!
    const found = data?.data?.accounts?.find(x => x.id === id)

    if (!found) {
      return
    }

    setForm({
      action: 'edit',
      accountId: id,
      data: {
        parent: undefined,
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

  console.log('f in', form)

  const cancelForm = () => setForm(undefined)

  const changeFormData = (
    fieldName: string,
    value: string | BaseSelectOption | undefined,
  ) => {
    if (!form) {
      return
    }

    setForm({
      ...form,
      data: {
        ...form.data,
        [fieldName]: value,
      },
    })
  }

  return {
    data: data?.data,
    isLoading,
    error,
    create,
    form,
    addAccount,
    editAccount,
    cancelForm,
    changeFormData,
    submitForm,
    showARForAccountId,
    setShowARForAccountId,
  }
}
