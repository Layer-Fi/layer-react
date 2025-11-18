import { type ButtonHTMLAttributes } from 'react'
import classNames from 'classnames'

import RefreshCcw from '@icons/RefreshCcw'
import { Button, ButtonVariant } from '@components/Button/Button'

export interface RetryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  processing?: boolean
  disabled?: boolean
  error: string
  fullWidth?: boolean
  iconOnly?: boolean
}

export const RetryButton = ({
  className,
  processing,
  disabled,
  error,
  children,
  ...props
}: RetryButtonProps) => {
  const baseClassName = classNames(
    'Layer__retry-btn',
    processing ? 'Layer__btn--processing' : '',
    className,
  )

  return (
    <Button
      {...props}
      className={baseClassName}
      variant={ButtonVariant.secondary}
      disabled={processing || disabled}
      rightIcon={<RefreshCcw size={12} />}
      justify='center'
      tooltip={error}
    >
      {children}
    </Button>
  )
}
