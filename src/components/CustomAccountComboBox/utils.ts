import type { TFunction } from 'i18next'

import type { AccountOption } from '@components/CustomAccountComboBox/AccountOption'

export const NEW_ACCOUNT_VALUE = 'new_account'

export const isNewAccountOption = (account: AccountOption | null): boolean =>
  account?.value === NEW_ACCOUNT_VALUE

export const formatCreateLabel = (inputValue: string, t: TFunction) =>
  inputValue
    ? t('upload:action.create_input_value', 'Create "{{inputValue}}"', { inputValue })
    : t('upload:action.create_account', 'Create account')
