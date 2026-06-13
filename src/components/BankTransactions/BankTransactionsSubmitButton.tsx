import { type ReactNode } from 'react'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { SubmitAction, SubmitButton } from '@ui/Button/SubmitButton'

import './bankTransactionsSubmitButton.scss'

type BankTransactionsSubmitButtonProps = {
  children: ReactNode
  onPress: () => void
  isPending?: boolean
  isDisabled?: boolean
  error?: string
  action?: SubmitAction
  active?: boolean
}

export const BankTransactionsSubmitButton = ({
  children,
  onPress,
  isPending,
  isDisabled,
  error,
  action = SubmitAction.SAVE,
  active,
}: BankTransactionsSubmitButtonProps) => {
  const dataProperties = toDataProperties({ active, error: Boolean(error) })

  return (
    <span className='Layer__BankTransactionsSubmitButton' {...dataProperties}>
      <SubmitButton
        iconBox
        withRetry
        onPress={onPress}
        isPending={isPending}
        isDisabled={isDisabled}
        error={error}
        action={action}
      >
        {children}
      </SubmitButton>
    </span>
  )
}
