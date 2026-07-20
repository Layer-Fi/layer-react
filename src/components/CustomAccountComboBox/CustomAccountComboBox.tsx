import { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import type { CustomAccount } from '@schemas/customAccounts'
import { useCustomAccounts } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
import { CreatableComboBox } from '@ui/ComboBox/CreatableComboBox'
import { VStack } from '@ui/Stack/Stack'
import { Label } from '@ui/Typography/Text'
import { type AccountOption } from '@components/CustomAccountComboBox/AccountOption'
import { AccountOptionSlot, AccountSingleValueSlot } from '@components/CustomAccountComboBox/AccountOptionSlots'
import { formatCreateLabel, isNewAccountOption, NEW_ACCOUNT_VALUE } from '@components/CustomAccountComboBox/utils'
import { CustomAccountForm } from '@components/CustomAccountForm/CustomAccountForm'

import './customAccountComboBox.scss'

type CustomAccountComboBoxProps = {
  label: string
  selectedAccount: AccountOption | null
  onSelectAccount: (account: AccountOption | null) => void
  inputId?: string
  placeholder?: string
  showLabel?: boolean
  inline?: boolean
  isInvalid?: boolean
  isReadOnly?: boolean
  className?: string
}

export function CustomAccountComboBox({
  label,
  selectedAccount,
  onSelectAccount,
  inputId = 'account_name',
  placeholder,
  showLabel = true,
  inline = false,
  isInvalid = false,
  isReadOnly = false,
  className,
}: CustomAccountComboBoxProps) {
  const { t } = useTranslation()
  const {
    data: customAccounts,
    isLoading: isLoadingCustomAccounts,
    error: customAccountsError,
  } = useCustomAccounts()

  const accountOptions = useMemo(() => {
    if (!customAccounts) return []

    return customAccounts.map(account => ({
      value: account.id,
      label: account.accountName,
      account,
    }))
  }, [customAccounts])

  const onCreateOption = useCallback((inputValue: string) => {
    onSelectAccount({
      value: NEW_ACCOUNT_VALUE,
      label: t('upload:action.create_account', 'Create account'),
      account: { accountName: inputValue },
      __isNew__: true,
    })
  }, [t, onSelectAccount])

  const onCreateAccountSuccess = useCallback((account: CustomAccount) => {
    onSelectAccount({
      value: account.id,
      label: account.accountName,
      account,
    })
  }, [onSelectAccount])

  const isCreatingNewAccount = isNewAccountOption(selectedAccount)

  return (
    <VStack gap='xs' className={className}>
      <div className={classNames('Layer__CustomAccountComboBox__Field', inline && 'Layer__CustomAccountComboBox__Field--inline')}>
        {showLabel && <Label size='sm' htmlFor={inputId}>{label}</Label>}
        <CreatableComboBox<AccountOption>
          inputId={inputId}
          placeholder={customAccountsError ? t('common:error.load_options', 'Failed to load options') : (placeholder ?? t('upload:action.select_account', 'Select account...'))}
          options={accountOptions}
          onSelectedValueChange={onSelectAccount}
          onCreateOption={onCreateOption}
          formatCreateLabel={inputValue => formatCreateLabel(inputValue, t)}
          isValidNewOption={() => true}
          selectedValue={selectedAccount}
          isClearable
          isLoading={isLoadingCustomAccounts}
          isDisabled={!!customAccountsError || isReadOnly}
          isError={!!customAccountsError}
          isInvalid={isInvalid}
          slots={{ Option: AccountOptionSlot, SingleValue: AccountSingleValueSlot }}
          aria-label={showLabel ? undefined : label}
        />
      </div>
      {isCreatingNewAccount && selectedAccount && (
        <VStack className='Layer__CustomAccountComboBox__CreateForm'>
          <CustomAccountForm
            initialAccountName={selectedAccount.account.accountName}
            onCancel={() => onSelectAccount(null)}
            onSuccess={onCreateAccountSuccess}
          />
        </VStack>
      )}
    </VStack>
  )
}
