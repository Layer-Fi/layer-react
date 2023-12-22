import React, { useMemo, useState } from 'react'
import Select from 'react-select'
import { useChartOfAccounts } from '../../hooks/useChartOfAccounts'
import { Account, Direction } from '../../types'

type Option<T = string> = { label: string; value: T }

const flattenAccounts = (accounts: Account[]): Account[] =>
  accounts
    .flatMap(a => [a, flattenAccounts(a.subAccounts || [])])
    .flat()
    .filter(id => id)

export const ChartOfAccountsNewForm = () => {
  const { data, create: createAccount } = useChartOfAccounts()
  const accountOptions: Account[] = useMemo(
    () =>
      flattenAccounts(data?.accounts || []).sort((a, b) =>
        a?.name && b?.name ? a.name.localeCompare(b.name) : 0,
      ),
    [data?.accounts?.length],
  )
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [normality, setNormality] = useState<Direction>(Direction.DEBIT)
  const [parentAccount, setParentAccount] = useState<Account | undefined>(
    data?.accounts[0],
  )

  const save = () => {
    createAccount({
      name,
      normality,
      parent_id: {
        type: 'AccountId',
        id: parentAccount?.id || '',
      },
      description,
    })
  }

  return (
    <div className="Layer__chart-of-accounts-new-form">
      <div className="Layer__chart-of-accounts-new-form__field">
        <span>Name</span>
        <input
          name="name"
          value={name}
          onChange={event => setName(event.target.value)}
        ></input>
      </div>
      <div className="Layer__chart-of-accounts-new-form__field">
        <span>Description</span>
        <input
          name="description"
          value={description}
          onChange={event => setDescription(event.target.value)}
        ></input>
      </div>
      <div className="Layer__chart-of-accounts-new-form__field">
        <span>Normality</span>
        <Select<Option<Direction>>
          isSearchable={false}
          onChange={value => value && setNormality(value.value)}
          options={[
            { label: 'Credit', value: Direction.CREDIT },
            { label: 'Debit', value: Direction.DEBIT },
          ]}
        />
      </div>
      <div className="Layer__chart-of-accounts-new-form__field">
        <span>Parent Account</span>
        <Select<Account>
          isSearchable={true}
          value={parentAccount}
          onChange={value => value && setParentAccount(value)}
          getOptionLabel={a => a.name}
          getOptionValue={a => a.id}
          options={accountOptions}
        />
      </div>
      <div className="Layer__chart-of-accounts-new-form__field Layer__chart-of-accounts-new-form__field--actions">
        <button onClick={save}>Save</button>
      </div>
    </div>
  )
}
