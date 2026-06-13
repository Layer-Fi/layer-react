import { type ReactNode } from 'react'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
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
    <span className='Layer__BankTransactionsSubmitButton' {...dataProperties}>
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
