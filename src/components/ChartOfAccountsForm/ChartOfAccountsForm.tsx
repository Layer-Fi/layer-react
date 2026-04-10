import { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { flattenAccounts } from '@hooks/legacy/useChartOfAccounts'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
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
  const { formatCurrencyFromCents } = useIntlFormatter()
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
                ? stringOverrides?.editModeHeader || t('chartOfAccounts:action.edit_account', 'Edit Account')
                : stringOverrides?.createModeHeader || t('chartOfAccounts:action.add_new_account', 'Add New Account')}
            </Heading>
          </HeaderCol>
          <HeaderCol className='actions'>
            <Button
              type='button'
              onClick={cancelForm}
              variant={ButtonVariant.secondary}
              disabled={sendingForm}
            >
              {stringOverrides?.cancelButton || t('common:action.cancel_label', 'Cancel')}
            </Button>
            {apiError && (
              <RetryButton
                type='submit'
                processing={sendingForm}
                error={t('chartOfAccounts:error.check_connection_retry_message', 'Check connection and retry in a few seconds.')}
                disabled={sendingForm}
              >
                {stringOverrides?.retryButton || t('common:action.retry_label', 'Retry')}
              </RetryButton>
            )}
            {!apiError && (
              <SubmitButton
                type='submit'
                noIcon={true}
                active={true}
                disabled={sendingForm}
              >
                {stringOverrides?.saveButton || t('common:action.save_label', 'Save')}
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
            {formatCurrencyFromCents(entry.balance)}
          </Text>
        </div>
      )}

      <div className='Layer__chart-of-accounts__form'>
        <InputGroup
          name='parent'
          label={stringOverrides?.parentLabel || t('chartOfAccounts:label.parent', 'Parent')}
          inline={true}
        >
          <Select
            options={parentOptions}
            value={form?.data.parent}
            onChange={sel => changeFormData('parent', sel)}
            disabled={sendingForm}
            isInvalid={!!(form?.errors?.find(x => x.field === 'parent'))}
            errorMessage={form?.errors?.find(x => x.field === 'parent')?.message}
          />
        </InputGroup>
        <InputGroup
          name='name'
          label={stringOverrides?.nameLabel || t('common:label.name', 'Name')}
          inline
        >
          <Input
            name='name'
            placeholder={t('chartOfAccounts:label.enter_name', 'Enter name...')}
            value={form?.data.name}
            isInvalid={!!(form?.errors?.find(x => x.field === 'name'))}
            errorMessage={form?.errors?.find(x => x.field === 'name')?.message}
            disabled={sendingForm}
            onChange={e =>
              changeFormData('name', (e.target as HTMLInputElement).value)}
          />
        </InputGroup>
        <InputGroup
          name='accountNumber'
          label={stringOverrides?.accountNumberLabel || t('generalLedger:label.account_number', 'Account Number')}
          inline
        >
          <Input
            name='accountNumber'
            placeholder={t('chartOfAccounts:label.enter_account_number', 'Enter account number...')}
            value={form?.data.accountNumber}
            isInvalid={!!(form?.errors?.find(x => x.field === 'accountNumber'))}
            errorMessage={form?.errors?.find(x => x.field === 'accountNumber')?.message}
            disabled={sendingForm}
            onChange={e =>
              changeFormData('accountNumber', (e.target as HTMLInputElement).value)}
          />
        </InputGroup>
        <InputGroup
          name='type'
          label={stringOverrides?.typeLabel || t('common:label.type', 'Type')}
          inline={true}
        >
          <Select
            options={ledgerAccountTypesOptions}
            value={form?.data.type}
            onChange={sel => changeFormData('type', sel)}
            isInvalid={!!(form?.errors?.find(x => x.field === 'type'))}
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
          label={stringOverrides?.subTypeLabel || t('chartOfAccounts:label.sub_type', 'Sub-Type')}
          inline={true}
        >
          <Select
            options={
              form?.data.type?.value !== undefined
                ? ledgerAccountSubtypesForType[form?.data.type?.value]
                : Object.values(ledgerAccountSubtypesForType).flat()
            }
            value={form?.data.subType}
            isInvalid={!!(form?.errors?.find(x => x.field === 'subType'))}
            errorMessage={form?.errors?.find(x => x.field === 'subType')?.message}
            onChange={sel => changeFormData('subType', sel)}
            disabled={sendingForm}
          />
        </InputGroup>
        <InputGroup
          name='normality'
          label={stringOverrides?.normalityLabel || t('common:label.normality', 'Normality')}
          inline={true}
        >
          <Select
            options={normalityOptions}
            value={form?.data.normality}
            isInvalid={!!(
              form?.errors?.find(x => x.field === 'normality')
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
            {stringOverrides?.cancelButton || t('common:action.cancel_label', 'Cancel')}
          </Button>
          {apiError && (
            <RetryButton
              type='submit'
              processing={sendingForm}
              error={t('chartOfAccounts:error.check_connection_retry_message', 'Check connection and retry in a few seconds.')}
              disabled={sendingForm}
            >
              {stringOverrides?.retryButton || t('common:action.retry_label', 'Retry')}
            </RetryButton>
          )}
          {!apiError && (
            <SubmitButton
              type='submit'
              noIcon={true}
              active={true}
              disabled={sendingForm}
            >
              {stringOverrides?.saveButton || t('common:action.save_label', 'Save')}
            </SubmitButton>
          )}
        </div>
      </div>
    </form>
  )
}
