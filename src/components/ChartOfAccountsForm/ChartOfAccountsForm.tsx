import React, { useContext, useMemo } from 'react'
import { flattenAccounts } from '../../hooks/useChartOfAccounts/useChartOfAccounts'
import { centsToDollars } from '../../models/Money'
import { Button, ButtonVariant, RetryButton, SubmitButton } from '../Button'
import { ChartOfAccountsContext } from '../ChartOfAccounts/ChartOfAccounts'
import { Input, InputGroup, Select } from '../Input'
import { Text, TextSize, TextWeight } from '../Typography'
import { SUB_TYPE_OPTIONS } from './constants'
import { useParentOptions } from './useParentOptions'

export const ChartOfAccountsForm = () => {
  const {
    form,
    data,
    changeFormData,
    cancelForm,
    submitForm,
    sendingForm,
    apiError,
  } = useContext(ChartOfAccountsContext)

  const parentOptions = useParentOptions(data)

  const entry = useMemo(() => {
    if (form?.action === 'edit' && form.accountId) {
      return flattenAccounts(data?.accounts || []).find(
        x => x.id === form.accountId,
      )
    }

    return
  }, [data, form?.accountId])

  if (!form) {
    return
  }

  return (
    <form
      className='Layer__form'
      onSubmit={e => {
        e.preventDefault()
        submitForm()
      }}
    >
      <div className='Layer__chart-of-accounts__sidebar__header'>
        <Text size={TextSize.lg} weight={TextWeight.bold} className='title'>
          {form?.action === 'edit' ? 'Edit' : 'Add New'} Account
        </Text>
        <div className='actions'>
          <Button
            type='button'
            onClick={cancelForm}
            variant={ButtonVariant.secondary}
            disabled={sendingForm}
          >
            Cancel
          </Button>
          {apiError && (
            <RetryButton
              type='submit'
              processing={sendingForm}
              error={'Check connection and retry in few seconds.'}
              disabled={sendingForm}
            >
              Retry
            </RetryButton>
          )}
          {!apiError && (
            <SubmitButton
              type='submit'
              noIcon={true}
              active={true}
              disabled={sendingForm}
            >
              Save
            </SubmitButton>
          )}
        </div>
      </div>

      {apiError && (
        <Text
          size={TextSize.sm}
          className='Layer__chart-of-accounts__form__error-message'
        >
          {apiError}
        </Text>
      )}

      {entry && (
        <div className='Layer__chart-of-accounts__form-edit-entry'>
          <Text weight={TextWeight.bold}>{entry.name}</Text>
          <Text weight={TextWeight.bold}>
            ${centsToDollars(entry.balance || 0)}
          </Text>
        </div>
      )}

      <div className='Layer__chart-of-accounts__form'>
        <InputGroup name='parent' label='Parent' inline={true}>
          <Select
            options={parentOptions}
            value={form?.data.parent}
            onChange={sel => changeFormData('parent', sel)}
            disabled={sendingForm}
          />
        </InputGroup>
        <InputGroup name='name' label='Name' inline={true}>
          <Input
            name='name'
            placeholder='Enter name...'
            value={form?.data.name}
            isInvalid={Boolean(form?.errors?.find(x => x.field === 'name'))}
            errorMessage={form?.errors?.find(x => x.field === 'name')?.message}
            disabled={sendingForm}
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
            disabled={sendingForm}
          />
        </InputGroup>
        <InputGroup name='category' label='Category' inline={true}>
          <Select
            options={[]}
            value={form?.data.category}
            onChange={sel => changeFormData('category', sel)}
            disabled={sendingForm}
          />
        </InputGroup>
      </div>
    </form>
  )
}
