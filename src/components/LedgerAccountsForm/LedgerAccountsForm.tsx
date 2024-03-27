import React, { useContext, useMemo } from 'react'
import { flattenAccounts } from '../../hooks/useLedgerAccounts/useLedgerAccounts'
import { Direction } from '../../types'
import { BaseSelectOption } from '../../types/general'
import { Button } from '../Button'
import { Input, InputGroup, Select } from '../Input'
import { LedgerAccountsContext } from '../LedgerAccounts/LedgerAccounts'
import { Text, TextSize, TextWeight } from '../Typography'

const SUB_TYPE_OPTIONS: BaseSelectOption[] = [
  {
    value: Direction.DEBIT,
    label: 'Debit',
  },
  {
    value: Direction.CREDIT,
    label: 'Credit',
  },
]

export const LedgerAccountsForm = () => {
  const { form, data, changeFormData, cancelForm, submitForm } = useContext(
    LedgerAccountsContext,
  )

  const parentOptions: BaseSelectOption[] = useMemo(
    () =>
      flattenAccounts(data?.accounts || [])
        .sort((a, b) => (a?.name && b?.name ? a.name.localeCompare(b.name) : 0))
        .map(x => {
          return {
            label: x.name,
            value: x.id,
          }
        }),
    [data?.accounts?.length],
  )

  if (!form) {
    return
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        submitForm()
      }}
    >
      <div className='Layer__ledger-accounts__sidebar__header'>
        <Text size={TextSize.lg} weight={TextWeight.bold} className='title'>
          {form?.action === 'edit' ? 'Edit' : 'Add New'} Account
        </Text>
        <div className='actions'>
          <Button type='button' onClick={cancelForm}>
            Cancel
          </Button>
          <Button type='submit'>Save</Button>
        </div>
      </div>

      <div className='Layer__ledger-accounts__form'>
        <InputGroup name='parent' label='Parent' inline={true}>
          <Select
            options={parentOptions}
            value={form?.data.parent}
            onChange={sel => changeFormData('parent', sel)}
          />
        </InputGroup>
        <InputGroup name='name' label='Name' inline={true}>
          <Input
            name='name'
            value={form?.data.name}
            onChange={e =>
              changeFormData('name', (e.target as HTMLInputElement).value)
            }
          />
        </InputGroup>
        <InputGroup name='type' label='Type' inline={true}>
          <Select
            options={[]}
            disabled
            value={form?.data.type}
            onChange={sel => changeFormData('type', sel)}
          />
        </InputGroup>
        <InputGroup name='subType' label='Sub-Type' inline={true}>
          <Select
            options={SUB_TYPE_OPTIONS}
            value={form?.data.subType}
            onChange={sel => changeFormData('subType', sel)}
          />
        </InputGroup>
        <InputGroup name='category' label='Category' inline={true}>
          <Select
            options={[]}
            value={form?.data.category}
            onChange={sel => changeFormData('category', sel)}
          />
        </InputGroup>
      </div>
    </form>
  )
}
