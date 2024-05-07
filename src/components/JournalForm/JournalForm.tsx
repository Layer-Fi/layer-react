import React, { useContext } from 'react'
import { Button, ButtonVariant, RetryButton, SubmitButton } from '../Button'
import { Input, InputGroup, Select } from '../Input'
import { JournalContext } from '../Journal/Journal'
import { Text, TextSize, TextWeight } from '../Typography'

export const JournalForm = () => {
  const { form, cancelForm, submitForm, sendingForm, apiError } =
    useContext(JournalContext)

  // const parentOptions = useParentOptions(data)

  return (
    <form
      className='Layer__form'
      onSubmit={e => {
        e.preventDefault()
        submitForm()
      }}
    >
      <div className='Layer__journal__sidebar__header'>
        <Text size={TextSize.lg} weight={TextWeight.bold} className='title'>
          Add New Entry
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
          className='Layer__journal__form__error-message'
        >
          {apiError}
        </Text>
      )}

      <div className='Layer__journal__form__input-group'>
        <InputGroup name='date' label='Date' inline={true}>
          <Select
            // options={parentOptions}
            value={form?.data.parent}
            onChange={sel => changeFormData('parent', sel)}
            disabled={sendingForm}
          />
          <Select
            // options={parentOptions}
            value={form?.data.parent}
            onChange={sel => changeFormData('parent', sel)}
            disabled={sendingForm}
          />
        </InputGroup>
      </div>
      <div className='Layer__journal__form__input-group Layer__journal__form__input-group__border'>
        <Text
          className='Layer__journal__form__input-group__title'
          size={TextSize.lg}
        >
          Add Debit Account
        </Text>
        <InputGroup name='amount' label='Amount' inline={true}>
          <Input
            name='amount'
            placeholder='Enter amount...'
            value={form?.data.name}
            isInvalid={Boolean(form?.errors?.find(x => x.field === 'name'))}
            errorMessage={form?.errors?.find(x => x.field === 'name')?.message}
            disabled={sendingForm}
            onChange={e =>
              changeFormData('name', (e.target as HTMLInputElement).value)
            }
          />
        </InputGroup>
        <InputGroup name='account-name' label='Account name' inline={true}>
          <Select
            options={[]}
            disabled
            value={form?.data.type}
            onChange={sel => changeFormData('type', sel)}
          />
        </InputGroup>
      </div>
      <div className='Layer__journal__form__input-group Layer__journal__form__input-group__border'>
        <Text
          className='Layer__journal__form__input-group__title'
          size={TextSize.lg}
        >
          Add Credit Account
        </Text>
        <InputGroup name='amount' label='Amount' inline={true}>
          <Input
            name='amount'
            placeholder='Enter amount...'
            value={form?.data.name}
            isInvalid={Boolean(form?.errors?.find(x => x.field === 'name'))}
            errorMessage={form?.errors?.find(x => x.field === 'name')?.message}
            disabled={sendingForm}
            onChange={e =>
              changeFormData('name', (e.target as HTMLInputElement).value)
            }
          />
        </InputGroup>
        <InputGroup name='account-name' label='Account name' inline={true}>
          <Select
            options={[]}
            disabled={sendingForm}
            value={form?.data.type}
            onChange={sel => changeFormData('type', sel)}
          />
        </InputGroup>
      </div>
    </form>
  )
}
