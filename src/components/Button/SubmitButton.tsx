import React, { ButtonHTMLAttributes } from 'react'
import AlertCircle from '../../icons/AlertCircle'
import Check from '../../icons/Check'
import CheckCircle from '../../icons/CheckCircle'
import Loader from '../../icons/Loader'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'
import { Button, ButtonVariant } from './Button'
import classNames from 'classnames'

export interface SubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  processing?: boolean
  disabled?: boolean
  error?: boolean | string
  active?: boolean
  iconOnly?: boolean
}

const buildRightIcon = ({
  processing,
  error,
}: {
  processing?: boolean
  error?: boolean | string
}) => {
  if (processing) {
    return <Loader size={14} className='Layer__anim--rotating' />
  }

  if (error) {
    return (
      <Tooltip offset={12}>
        <TooltipTrigger>
          <AlertCircle size={14} />
        </TooltipTrigger>
        <TooltipContent className='Layer__tooltip'>{error}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <span>
      <Check className='Layer__btn-icon--on-active' size={14} />
      <CheckCircle
        className='Layer__btn-icon--on-inactive'
        size={14}
        style={{ paddingTop: 4 }}
      />
    </span>
  )
}

export const SubmitButton = ({
  active,
  className,
  processing,
  disabled,
  error,
  children,
  ...props
}: SubmitButtonProps) => {
  const baseClassName = classNames(
    active ? 'Layer__btn--active' : '',
    className,
  )

  return (
    <Button
      {...props}
      className={baseClassName}
      variant={ButtonVariant.primary}
      disabled={processing || disabled}
      rightIcon={buildRightIcon({ processing, error })}
    >
      {children}
    </Button>
  )
}
