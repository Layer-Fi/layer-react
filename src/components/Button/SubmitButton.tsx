import React, { ButtonHTMLAttributes } from 'react'
import AlertCircle from '../../icons/AlertCircle'
import CheckCircle from '../../icons/CheckCircle'
import Loader from '../../icons/Loader'
import Save from '../../icons/Save'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'
import { Button, ButtonProps, ButtonVariant } from './Button'
import classNames from 'classnames'

export interface SubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  processing?: boolean
  disabled?: boolean
  error?: boolean | string
  active?: boolean
  iconOnly?: boolean
  action?: SubmitAction
  noIcon?: boolean
  tooltip?: ButtonProps['tooltip']
}

export enum SubmitAction {
  SAVE = 'save',
  UPDATE = 'update',
}

const buildRightIcon = ({
  processing,
  error,
  action,
  noIcon,
}: {
  processing?: boolean
  error?: boolean | string
  action: SubmitAction
  noIcon?: boolean
}) => {
  if (noIcon) {
    return
  }

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
        <CheckCircle size={14} />
      </span>
    )
  }

  return (
    <span>
      <Save size={14} style={{ paddingTop: 4 }} />
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
  noIcon,
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
      rightIcon={buildRightIcon({ processing, error, action, noIcon })}
      iconAsPrimary={true}
    >
      {children}
    </Button>
  )
}
