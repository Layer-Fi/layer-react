import { HeaderRow } from '../Header/HeaderRow'
import { HeaderCol } from '../Header/HeaderCol'
import { Header } from '../Header/Header'
import { SubmitButton } from '../Button/SubmitButton'
import { RetryButton } from '../Button/RetryButton'
import { Button, ButtonVariant } from '../Button/Button'
import { useContext, useMemo } from 'react'
import { ChartOfAccountsContext } from '../../contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import { flattenAccounts } from '../../hooks/useChartOfAccounts/useChartOfAccounts'
import { Input, InputGroup, Select } from '../Input'
import { Heading, HeadingSize, Text, TextSize, TextWeight } from '../Typography'
import {
  LEDGER_ACCOUNT_SUBTYPES,
  LEDGER_ACCOUNT_SUBTYPES_FOR_TYPE,
  LEDGER_ACCOUNT_TYPES,
  NORMALITY_OPTIONS,
} from './constants'
import { useParentOptions } from './useParentOptions'
import { convertCentsToCurrency } from '../../utils/format'

export interface ChartOfAccountsFormStringOverrides {
  editModeHeader?: string
  createModeHeader?: string
  cancelButton?: string
  retryButton?: string
  saveButton?: string
  parentLabel?: string
  nameLabel?: string
  accountNumberLabel?: string
  typeLabel?: string
  subTypeLabel?: string
  normalityLabel?: string
}

export const ChartOfAccountsForm = ({
  stringOverrides,
}: {
  stringOverrides?: ChartOfAccountsFormStringOverrides
}) => {
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
        x => x.accountId === form.accountId,
      )
    }

    return
  }, [data?.accounts, form?.accountId, form?.action])

  if (!form) {
    return null
  }

  return (
    <form
      className='Layer__form'
      onSubmit={(e) => {
        e.preventDefault()
        submitForm()
      }}
    >
      <Header className='Layer__chart-of-accounts__sidebar__header'>
        <HeaderRow>
          <HeaderCol>
            <Heading size={HeadingSize.secondary} className='title'>
              {form?.action === 'edit'
                ? stringOverrides?.editModeHeader || 'Edit Account'
                : stringOverrides?.createModeHeader || 'Add New Account'}
            </Heading>
          </HeaderCol>
          <HeaderCol className='actions'>
            <Button
              type='button'
              onClick={cancelForm}
              variant={ButtonVariant.secondary}
              disabled={sendingForm}
            >
              {stringOverrides?.cancelButton || 'Cancel'}
            </Button>
            {apiError && (
              <RetryButton
                type='submit'
                processing={sendingForm}
                error='Check connection and retry in few seconds.'
                disabled={sendingForm}
              >
                {stringOverrides?.retryButton || 'Retry'}
              </RetryButton>
            )}
            {!apiError && (
              <SubmitButton
                type='submit'
                noIcon={true}
                active={true}
                disabled={sendingForm}
              >
                {stringOverrides?.saveButton || 'Save'}
              </SubmitButton>
            )}
          </HeaderCol>
        </HeaderRow>
      </Header>

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
            {convertCentsToCurrency(entry.balance)}
          </Text>
        </div>
      )}

      <div className='Layer__chart-of-accounts__form'>
        <InputGroup
          name='parent'
          label={stringOverrides?.parentLabel || 'Parent'}
          inline={true}
        >
          <Select
            options={parentOptions}
            value={form?.data.parent}
            onChange={sel => changeFormData('parent', sel)}
            disabled={sendingForm}
          />
        </InputGroup>
        <InputGroup
          name='name'
          label={stringOverrides?.nameLabel || 'Name'}
          inline
        >
          <Input
            name='name'
            placeholder='Enter name...'
            value={form?.data.name}
            isInvalid={Boolean(form?.errors?.find(x => x.field === 'name'))}
            errorMessage={form?.errors?.find(x => x.field === 'name')?.message}
            disabled={sendingForm}
            onChange={e =>
              changeFormData('name', (e.target as HTMLInputElement).value)}
          />
        </InputGroup>
        <InputGroup
          name='accountNumber'
          label={stringOverrides?.accountNumberLabel || 'Account Number'}
          inline
        >
          <Input
            name='accountNumber'
            placeholder='Enter account number...'
            value={form?.data.accountNumber}
            isInvalid={Boolean(form?.errors?.find(x => x.field === 'accountNumber'))}
            errorMessage={form?.errors?.find(x => x.field === 'accountNumber')?.message}
            disabled={sendingForm}
            onChange={e =>
              changeFormData('accountNumber', (e.target as HTMLInputElement).value)}
          />
        </InputGroup>
        <InputGroup
          name='type'
          label={stringOverrides?.typeLabel || 'Type'}
          inline={true}
        >
          <Select
            options={LEDGER_ACCOUNT_TYPES}
            value={form?.data.type}
            onChange={sel => changeFormData('type', sel)}
            isInvalid={Boolean(form?.errors?.find(x => x.field === 'type'))}
            errorMessage={form?.errors?.find(x => x.field === 'type')?.message}
            disabled={
              sendingForm
              || form.action === 'edit'
              || form.data.parent !== undefined
            }
          />
        </InputGroup>
        <InputGroup
          name='subType'
          label={stringOverrides?.subTypeLabel || 'Sub-Type'}
          inline={true}
        >
          <Select
            options={
              form?.data.type?.value !== undefined
                ? LEDGER_ACCOUNT_SUBTYPES_FOR_TYPE[form?.data.type?.value]
                : LEDGER_ACCOUNT_SUBTYPES
            }
            value={form?.data.subType}
            onChange={sel => changeFormData('subType', sel)}
            disabled={sendingForm}
          />
        </InputGroup>
        <InputGroup
          name='normality'
          label={stringOverrides?.normalityLabel || 'Normality'}
          inline={true}
        >
          <Select
            options={NORMALITY_OPTIONS}
            value={form?.data.normality}
            isInvalid={Boolean(
              form?.errors?.find(x => x.field === 'normality'),
            )}
            errorMessage={
              form?.errors?.find(x => x.field === 'normality')?.message
            }
            onChange={sel => changeFormData('normality', sel)}
            disabled={sendingForm}
          />
        </InputGroup>

        <div className='actions'>
          <Button
            type='button'
            onClick={cancelForm}
            variant={ButtonVariant.secondary}
            disabled={sendingForm}
          >
            {stringOverrides?.cancelButton || 'Cancel'}
          </Button>
          {apiError && (
            <RetryButton
              type='submit'
              processing={sendingForm}
              error='Check connection and retry in few seconds.'
              disabled={sendingForm}
            >
              {stringOverrides?.retryButton || 'Retry'}
            </RetryButton>
          )}
          {!apiError && (
            <SubmitButton
              type='submit'
              noIcon={true}
              active={true}
              disabled={sendingForm}
            >
              {stringOverrides?.saveButton || 'Save'}
            </SubmitButton>
          )}
        </div>
      </div>
    </form>
  )
}
