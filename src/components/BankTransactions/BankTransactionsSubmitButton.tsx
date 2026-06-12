import { type ReactNode } from 'react'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { SubmitAction, SubmitButton } from '@ui/Button/SubmitButton'

import './bankTransactionsSubmitButton.scss'

type BankTransactionsSubmitButtonProps = {
  children: ReactNode
  onPress: () => void
  processing?: boolean
  disabled?: boolean
  error?: string
  action?: SubmitAction
  active?: boolean
}

export const BankTransactionsSubmitButton = ({
  children,
  onPress,
  processing,
  disabled,
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
        onClick={onPress}
        processing={processing}
        disabled={disabled}
        error={error}
        action={action}
      >
        {children}
      </SubmitButton>
    </span>
  )
}
