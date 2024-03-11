import React, { ButtonHTMLAttributes } from 'react'
import AlertCircle from '../../icons/AlertCircle'
import Check from '../../icons/Check'
import CheckCircle from '../../icons/CheckCircle'
import Loader from '../../icons/Loader'
import Save from '../../icons/Save'
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
  action?: SubmitAction
}

export enum SubmitAction {
  SAVE = 'save',
  UPDATE = 'update',
}

const buildRightIcon = ({
  processing,
  error,
  action,
}: {
  processing?: boolean
  error?: boolean | string
  action: SubmitAction
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

  if (action === SubmitAction.UPDATE) {
    return (
      <span className='Layer__pt-2'>
        <Save size={14} />
      </span>
    )
  }

  return (
    <span>
      <CheckCircle size={14} style={{ paddingTop: 4 }} />
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
  action = SubmitAction.SAVE,
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
      rightIcon={buildRightIcon({ processing, error, action })}
      iconAsPrimary={true}
    >
      {children}
    </Button>
  )
}
