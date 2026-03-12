import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { convertCentsToCurrency } from '@utils/format'
import { flattenAccounts } from '@hooks/legacy/useChartOfAccounts'
import { ChartOfAccountsContext } from '@contexts/ChartOfAccountsContext/ChartOfAccountsContext'
import { Button, ButtonVariant } from '@components/Button/Button'
import { RetryButton } from '@components/Button/RetryButton'
import { SubmitButton } from '@components/Button/SubmitButton'
import { useChartOfAccountsFormOptions } from '@components/ChartOfAccountsForm/useChartOfAccountsFormOptions'
import { useParentOptions } from '@components/ChartOfAccountsForm/useParentOptions'
import { Header } from '@components/Header/Header'
import { HeaderCol } from '@components/Header/HeaderCol'
import { HeaderRow } from '@components/Header/HeaderRow'
import { Input } from '@components/Input/Input'
import { InputGroup } from '@components/Input/InputGroup'
import { Select } from '@components/Input/Select'
import { Heading, HeadingSize } from '@components/Typography/Heading'
import { Text, TextSize, TextWeight } from '@components/Typography/Text'

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
  const { t } = useTranslation()
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
  const {
    ledgerAccountTypesOptions,
    normalityOptions,
    ledgerAccountSubtypesForType,
  } = useChartOfAccountsFormOptions()

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
                ? stringOverrides?.editModeHeader || t('editAccount', 'Edit Account')
                : stringOverrides?.createModeHeader || t('addNewAccount', 'Add New Account')}
            </Heading>
          </HeaderCol>
          <HeaderCol className='actions'>
            <Button
              type='button'
              onClick={cancelForm}
              variant={ButtonVariant.secondary}
              disabled={sendingForm}
            >
              {stringOverrides?.cancelButton || t('cancel', 'Cancel')}
            </Button>
            {apiError && (
              <RetryButton
                type='submit'
                processing={sendingForm}
                error={t('checkConnectionAndRetry', 'Check connection and retry in few seconds.')}
                disabled={sendingForm}
              >
                {stringOverrides?.retryButton || t('retry', 'Retry')}
              </RetryButton>
            )}
            {!apiError && (
              <SubmitButton
                type='submit'
                noIcon={true}
                active={true}
                disabled={sendingForm}
              >
                {stringOverrides?.saveButton || t('save', 'Save')}
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
          label={stringOverrides?.parentLabel || t('parent', 'Parent')}
          inline={true}
        >
          <Select
            options={parentOptions}
            value={form?.data.parent}
            onChange={sel => changeFormData('parent', sel)}
            disabled={sendingForm}
            isInvalid={Boolean(form?.errors?.find(x => x.field === 'parent'))}
            errorMessage={form?.errors?.find(x => x.field === 'parent')?.message}
          />
        </InputGroup>
        <InputGroup
          name='name'
          label={stringOverrides?.nameLabel || t('name', 'Name')}
          inline
        >
          <Input
            name='name'
            placeholder={t('enterName', 'Enter name...')}
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
          label={stringOverrides?.accountNumberLabel || t('accountNumber', 'Account Number')}
          inline
        >
          <Input
            name='accountNumber'
            placeholder={t('enterAccountNumber', 'Enter account number...')}
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
          label={stringOverrides?.typeLabel || t('type', 'Type')}
          inline={true}
        >
          <Select
            options={ledgerAccountTypesOptions}
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
          label={stringOverrides?.subTypeLabel || t('subType', 'Sub-Type')}
          inline={true}
        >
          <Select
            options={
              form?.data.type?.value !== undefined
                ? ledgerAccountSubtypesForType[form?.data.type?.value]
                : Object.values(ledgerAccountSubtypesForType).flat()
            }
            value={form?.data.subType}
            isInvalid={Boolean(form?.errors?.find(x => x.field === 'subType'))}
            errorMessage={form?.errors?.find(x => x.field === 'subType')?.message}
            onChange={sel => changeFormData('subType', sel)}
            disabled={sendingForm}
          />
        </InputGroup>
        <InputGroup
          name='normality'
          label={stringOverrides?.normalityLabel || t('normality', 'Normality')}
          inline={true}
        >
          <Select
            options={normalityOptions}
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
            {stringOverrides?.cancelButton || t('cancel', 'Cancel')}
          </Button>
          {apiError && (
            <RetryButton
              type='submit'
              processing={sendingForm}
              error={t('checkConnectionAndRetryInFewSeconds', 'Check connection and retry in few seconds.')}
              disabled={sendingForm}
            >
              {stringOverrides?.retryButton || t('retry', 'Retry')}
            </RetryButton>
          )}
          {!apiError && (
            <SubmitButton
              type='submit'
              noIcon={true}
              active={true}
              disabled={sendingForm}
            >
              {stringOverrides?.saveButton || t('save', 'Save')}
            </SubmitButton>
          )}
        </div>
      </div>
    </form>
  )
}
