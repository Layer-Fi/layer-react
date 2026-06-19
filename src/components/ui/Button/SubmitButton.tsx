import { type ReactNode } from 'react'
import { CircleAlert, CircleCheckBig, RefreshCcw, Save, UploadCloud } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, type ButtonProps } from '@ui/Button/Button'
import { ButtonIconBox } from '@ui/Button/ButtonIconBox'

export interface SubmitButtonProps {
  children?: ReactNode
  onPress?: ButtonProps['onPress']
  type?: ButtonProps['type']
  isPending?: boolean
  isDisabled?: boolean
  isError?: boolean
  errorMessage?: string
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
  isError,
  action,
  noIcon,
}: {
  isError?: boolean
  action: SubmitAction
  noIcon?: boolean
}) => {
  if (noIcon) {
    return null
  }

  if (isError) {
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
  isPending,
  isDisabled,
  isError,
  errorMessage,
  children,
  action = SubmitAction.SAVE,
  noIcon,
  iconBox,
  tooltip,
  withRetry,
  onPress,
  type,
}: SubmitButtonProps) => {
  const { t } = useTranslation()

  if (withRetry && isError) {
    return (
      <Button
        variant='outlined'
        onPress={onPress}
        type={type}
        isDisabled={isPending || isDisabled}
        isPending={isPending}
        tooltip={errorMessage ?? t('common:error.something_went_wrong', 'Something went wrong')}
      >
        {children}
        <RefreshCcw size={12} />
      </Button>
    )
  }

  return (
    <Button
      onPress={onPress}
      type={type}
      isDisabled={isPending || isDisabled}
      isPending={isPending}
      tooltip={isError ? (errorMessage ?? tooltip) : tooltip}
    >
      {children}
      {withRenderedIcon({ isError, action, noIcon, iconBox })}
    </Button>
  )
}
