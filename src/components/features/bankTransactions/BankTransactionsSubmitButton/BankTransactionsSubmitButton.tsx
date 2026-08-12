import { type ReactNode } from 'react'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { SubmitAction, SubmitButton, type SubmitButtonProps } from '@ui/Button/SubmitButton'

import './bankTransactionsSubmitButton.scss'

/* Feature-specific, so it is passed to the shared `SubmitButton` rather than living on it. */
const legacyClassNames = createLegacyClassNames({
  'state:submit': 'Layer__bank-transaction__submit-btn',
  'state:retry': 'Layer__bank-transaction__retry-btn',
})

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
        className={legacyClassNames(isError ? 'state:retry' : 'state:submit')}
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
