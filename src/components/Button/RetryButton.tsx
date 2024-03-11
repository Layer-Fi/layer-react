import React, { ButtonHTMLAttributes } from 'react'
import RefreshCcw from '../../icons/RefreshCcw'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'
import { Button, ButtonVariant } from './Button'
import classNames from 'classnames'

export interface RetryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  processing?: boolean
  disabled?: boolean
  error: string
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
    >
      {children}
    </Button>
  )
}
