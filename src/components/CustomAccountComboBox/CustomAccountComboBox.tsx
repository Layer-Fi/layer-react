import { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import type { TFunction } from 'i18next'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { CustomAccount } from '@schemas/customAccounts'
import { humanizeEnum } from '@utils/format'
import { useCustomAccounts } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
import { COMBO_BOX_CLASS_NAMES } from '@ui/ComboBox/classnames'
import { CreatableComboBox } from '@ui/ComboBox/CreatableComboBox'
import { HStack, VStack } from '@ui/Stack/Stack'
import { Label, Span } from '@ui/Typography/Text'
import { CustomAccountForm } from '@components/CustomAccountForm/CustomAccountForm'

import './customAccountComboBox.scss'

export type AccountOption = {
  value: string
  label: string
  account: Partial<CustomAccount> & Pick<CustomAccount, 'accountName'>
  __isNew__?: true
}

const NEW_ACCOUNT_VALUE = 'new_account'

export const isNewAccountOption = (account: AccountOption | null): boolean =>
  account?.value === NEW_ACCOUNT_VALUE

const formatCreateLabel = (inputValue: string, t: TFunction) =>
  inputValue
    ? t('upload:action.create_input_value', 'Create "{{inputValue}}"', { inputValue })
    : t('upload:action.create_account', 'Create account')

const AccountOptionSlot = ({ option, fallback }: { option: AccountOption, fallback: React.ReactNode }) => {
  if (option.account && !option.__isNew__) {
    return (
      <HStack gap='xs' align='center'>
        <Check size={16} className={COMBO_BOX_CLASS_NAMES.OPTION_CHECK_ICON} />
        <VStack>
          <Span ellipsis>{option.account.accountName}</Span>
          <Span size='sm' variant='subtle' noWrap>
            {option.account.institutionName}
            {' · '}
            {humanizeEnum(option.account.accountSubtype!)}
          </Span>
        </VStack>
      </HStack>
    )
  }

  return fallback
}

const AccountSingleValueSlot = ({ option, fallback }: { option: AccountOption, fallback: React.ReactNode }) => {
  if (option.account && !option.__isNew__) {
    return <Span ellipsis>{option.account.accountName}</Span>
  }

  return fallback
}

type CustomAccountComboBoxProps = {
  label: string
  selectedAccount: AccountOption | null
  onSelectAccount: (account: AccountOption | null) => void
  inputId?: string
  placeholder?: string
  showLabel?: boolean
  inline?: boolean
  isInvalid?: boolean
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
  className,
}: CustomAccountComboBoxProps) {
  const { t } = useTranslation()
  const {
    data: customAccounts,
    isLoading: isLoadingCustomAccounts,
    error: customAccountsError,
  } = useCustomAccounts({ userCreated: true })

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
          isDisabled={!!customAccountsError}
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
