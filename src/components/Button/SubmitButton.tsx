import { type ButtonHTMLAttributes } from 'react'
import classNames from 'classnames'
import { CircleAlert, CircleCheckBig, Loader, Save, UploadCloud } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, type ButtonProps, ButtonVariant } from '@components/Button/Button'
import { RetryButton } from '@components/Button/RetryButton'
import { DeprecatedTooltip, DeprecatedTooltipContent, DeprecatedTooltipTrigger } from '@components/Tooltip/Tooltip'

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
          <CircleAlert size={14} />
        </DeprecatedTooltipTrigger>
        <DeprecatedTooltipContent className='Layer__tooltip'>{error}</DeprecatedTooltipContent>
      </DeprecatedTooltip>
    )
  }

  if (action === SubmitAction.UPLOAD) {
    return <UploadCloud size={12} />
  }

  if (action === SubmitAction.UPDATE) {
    return <CircleCheckBig size={14} />
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
  const { t } = useTranslation()
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
        error={typeof error === 'string' ? error : t('common:error.something_went_wrong', 'Something went wrong')}
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
