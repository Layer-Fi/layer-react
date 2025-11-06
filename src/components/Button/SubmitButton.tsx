import { RetryButton } from '@components/Button/RetryButton'
import { ButtonHTMLAttributes } from 'react'
import AlertCircle from '@icons/AlertCircle'
import CheckCircle from '@icons/CheckCircle'
import Loader from '@icons/Loader'
import Save from '@icons/Save'
import { DeprecatedTooltip, DeprecatedTooltipTrigger, DeprecatedTooltipContent } from '@components/Tooltip/Tooltip'
import { ButtonProps, Button, ButtonVariant } from '@components/Button/Button'
import classNames from 'classnames'
import { UploadCloud } from 'lucide-react'

export interface SubmitButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  processing?: boolean
  disabled?: boolean
  error?: boolean | string
  active?: boolean
  iconOnly?: boolean
  variant?: ButtonProps['variant']
  action?: SubmitAction
  noIcon?: boolean
  tooltip?: ButtonProps['tooltip']
  withRetry?: boolean
  iconAsPrimary?: boolean
}

export enum SubmitAction {
  SAVE = 'save',
  UPDATE = 'update',
  UPLOAD = 'upload',
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
      <DeprecatedTooltip offset={12}>
        <DeprecatedTooltipTrigger>
          <AlertCircle size={14} />
        </DeprecatedTooltipTrigger>
        <DeprecatedTooltipContent className='Layer__tooltip'>{error}</DeprecatedTooltipContent>
      </DeprecatedTooltip>
    )
  }

  if (action === SubmitAction.UPLOAD) {
    return <UploadCloud size={12} />
  }

  if (action === SubmitAction.UPDATE) {
    return <CheckCircle size={14} />
  }

  return <Save size={16} />
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
  iconAsPrimary = true,
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
      iconAsPrimary={iconAsPrimary}
    >
      {children}
    </Button>
  )
}
