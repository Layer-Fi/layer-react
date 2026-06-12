import { type ReactNode } from 'react'
import { CircleAlert, CircleCheckBig, RefreshCcw, Save, UploadCloud } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, type ButtonProps } from '@ui/Button/Button'
import { ButtonIconBox } from '@ui/Button/ButtonIconBox'

export interface SubmitButtonProps {
  children?: ReactNode
  onClick?: ButtonProps['onClick']
  type?: ButtonProps['type']
  processing?: boolean
  disabled?: boolean
  error?: boolean | string
  action?: SubmitAction
  noIcon?: boolean
  iconBox?: true
  tooltip?: ButtonProps['tooltip']
  withRetry?: boolean
}

export enum SubmitAction {
  SAVE = 'save',
  UPDATE = 'update',
  UPLOAD = 'upload',
}

const buildIcon = ({
  error,
  action,
  noIcon,
}: {
  error?: boolean | string
  action: SubmitAction
  noIcon?: boolean
}) => {
  if (noIcon) {
    return null
  }

  if (error) {
    return <CircleAlert size={14} />
  }

  if (action === SubmitAction.UPLOAD) {
    return <UploadCloud size={12} />
  }

  if (action === SubmitAction.UPDATE) {
    return <CircleCheckBig size={14} />
  }

  return <Save size={16} />
}

const withRenderedIcon = ({
  iconBox,
  ...iconProps
}: Parameters<typeof buildIcon>[0] & { iconBox?: true }) => {
  const icon = buildIcon(iconProps)

  if (icon && iconBox) {
    return <ButtonIconBox>{icon}</ButtonIconBox>
  }

  return icon
}

export const SubmitButton = ({
  processing,
  disabled,
  error,
  children,
  action = SubmitAction.SAVE,
  noIcon,
  iconBox,
  tooltip,
  withRetry,
  onClick,
  type,
}: SubmitButtonProps) => {
  const { t } = useTranslation()

  if (withRetry && error) {
    return (
      <Button
        variant='outlined'
        onClick={onClick}
        type={type}
        isDisabled={processing || disabled}
        isPending={processing}
        tooltip={typeof error === 'string' ? error : t('common:error.something_went_wrong', 'Something went wrong')}
      >
        {children}
        <RefreshCcw size={12} />
      </Button>
    )
  }

  return (
    <Button
      onClick={onClick}
      type={type}
      isDisabled={processing || disabled}
      isPending={processing}
      tooltip={typeof error === 'string' ? error : tooltip}
    >
      {children}
      {withRenderedIcon({ error, action, noIcon, iconBox })}
    </Button>
  )
}
