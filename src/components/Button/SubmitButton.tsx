import { ButtonHTMLAttributes } from 'react'
import AlertCircle from '../../icons/AlertCircle'
import CheckCircle from '../../icons/CheckCircle'
import Loader from '../../icons/Loader'
import Save from '../../icons/Save'
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip'
import { Button, ButtonProps, ButtonVariant } from './Button'
import classNames from 'classnames'
import { RetryButton } from './RetryButton'

export interface SubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  processing?: boolean
  disabled?: boolean
  error?: boolean | string
  active?: boolean
  variant?: ButtonProps['variant']
  iconOnly?: boolean
  action?: SubmitAction
  noIcon?: boolean
  tooltip?: ButtonProps['tooltip']
  withRetry?: boolean
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
  variant = ButtonVariant.primary,
  withRetry,
  ...props
}: SubmitButtonProps) => {
  const baseClassName = classNames(
    active ? 'Layer__btn--active' : '',
    className,
  )

  if (withRetry && error) {
    return (
      <RetryButton
        {...props}
        className={baseClassName}
        disabled={processing || disabled}
        error={typeof error === 'string' ? error : 'Something went wrong'}
      >
        {children}
      </RetryButton>
    )
  }

  return (
    <Button
      {...props}
      className={baseClassName}
      variant={variant}
      disabled={processing || disabled}
      rightIcon={buildRightIcon({ processing, error, action, noIcon })}
      iconAsPrimary={true}
    >
      {children}
    </Button>
  )
}
