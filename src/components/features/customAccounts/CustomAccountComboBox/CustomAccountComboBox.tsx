import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import type { CustomAccount } from '@schemas/features/customAccounts/customAccount'
import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { useGetCustomAccounts } from '@api/businesses/[business-id]/custom-accounts/get'
import { CreatableComboBox } from '@ui/ComboBox/CreatableComboBox'
import { VStack } from '@ui/Stack/Stack'
import { ComboBoxField } from '@blocks/Form/ComboBoxField'
import { type AccountOption } from '@features/customAccounts/CustomAccountComboBox/AccountOption'
import { AccountOptionSlot, AccountSingleValueSlot } from '@features/customAccounts/CustomAccountComboBox/AccountOptionSlots'
import { formatCreateLabel, isNewAccountOption, NEW_ACCOUNT_VALUE } from '@features/customAccounts/CustomAccountComboBox/utils'
import { CustomAccountForm } from '@features/customAccounts/CustomAccountForm/CustomAccountForm'

import './customAccountComboBox.scss'

/*
 * This field had its own wrapper class until `FormFieldShell` took over the layout. It was dropped
 * rather than renamed, so there is no current name to sit alongside — these keys name the state that
 * produced it and emit only the old name.
 */
const legacyClassNames = createLegacyClassNames({
  'field:default': 'Layer__CustomAccountComboBox__Field',
  'field:inline': 'Layer__CustomAccountComboBox__Field--inline',
})

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
  inputId,
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
  } = useGetCustomAccounts()

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
      <ComboBoxField
        label={label}
        className={legacyClassNames('field:default', inline && 'field:inline')}
        inline={inline}
        showLabel={showLabel}
        inputId={inputId}
      >
        {controlProps => (
          <CreatableComboBox<AccountOption>
            {...controlProps}
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
          />
        )}
      </ComboBoxField>
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
