import { type ReactNode } from 'react'
import classNames from 'classnames'

import { BANK_TRANSACTIONS_LEGACY_CLASS_NAMES } from '@utils/shared/styles/legacy-styling/legacy-styling-bank-transactions'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { SubmitAction, SubmitButton, type SubmitButtonProps } from '@ui/Button/SubmitButton'

import './bankTransactionsSubmitButton.scss'

type BankTransactionsSubmitButtonProps =
  Pick<SubmitButtonProps, 'isPending' | 'isDisabled' | 'isError' | 'errorMessage' | 'action'> & {
    children: ReactNode
    onPress: SubmitButtonProps['onPress']
    isActive?: boolean
  }

export const BankTransactionsSubmitButton = ({
  children,
  onPress,
  isPending,
  isDisabled,
  isError,
  errorMessage,
  action = SubmitAction.SAVE,
  isActive,
}: BankTransactionsSubmitButtonProps) => {
  const dataProperties = toDataProperties({ active: isActive, error: isError })

  return (
    <span
      className={classNames(
        'Layer__BankTransactionsSubmitButton',
        BANK_TRANSACTIONS_LEGACY_CLASS_NAMES.submitButton,
      )}
      {...dataProperties}
    >
      <SubmitButton
        iconBox
        withRetry
        onPress={onPress}
        isPending={isPending}
        isDisabled={isDisabled}
        isError={isError}
        errorMessage={errorMessage}
        action={action}
      >
        {children}
      </SubmitButton>
    </span>
  )
}
