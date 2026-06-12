import { type ReactNode } from 'react'
import { CircleCheckBig, RefreshCcw, Save } from 'lucide-react'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { Button } from '@ui/Button/Button'
import { SubmitAction } from '@ui/Button/SubmitButton'

import './bankTransactionsSubmitButton.scss'

const CLASS_NAME = 'Layer__BankTransactionsSubmitButton'

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
  const isDisabled = processing || disabled

  if (error) {
    return (
      <span className={CLASS_NAME} {...dataProperties}>
        <Button variant='outlined' onPress={onPress} isDisabled={isDisabled} isPending={processing} tooltip={error}>
          {children}
          <RefreshCcw size={12} />
        </Button>
      </span>
    )
  }

  return (
    <span className={CLASS_NAME} {...dataProperties}>
      <Button onPress={onPress} isDisabled={isDisabled} isPending={processing}>
        <span className={`${CLASS_NAME}__Label`}>{children}</span>
        <span className={`${CLASS_NAME}__IconBox`}>
          {action === SubmitAction.UPDATE ? <CircleCheckBig size={14} /> : <Save size={16} />}
        </span>
      </Button>
    </span>
  )
}
