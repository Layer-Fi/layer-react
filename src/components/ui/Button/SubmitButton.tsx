import { type ReactNode } from 'react'
import { CircleAlert, CircleCheckBig, RefreshCcw, Save, UploadCloud } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, type ButtonProps } from '@ui/Button/Button'
import { ButtonIconBox } from '@ui/Button/ButtonIconBox'
import { LoadingSpinner } from '@ui/Loading/LoadingSpinner'

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
  isPending,
  iconBox,
  ...iconProps
}: Parameters<typeof buildIcon>[0] & { isPending?: boolean, iconBox?: true }) => {
  if (iconProps.noIcon) {
    return null
  }

  if (isPending && iconBox) {
    return <ButtonIconBox><LoadingSpinner size={16} /></ButtonIconBox>
  }

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
  const shouldRenderPendingInIconBox = isPending && iconBox && !noIcon

  if (withRetry && isError) {
    return (
      <Button
        variant='outlined'
        onPress={onPress}
        type={type}
        isDisabled={isPending || isDisabled}
        isPending={shouldRenderPendingInIconBox ? false : isPending}
        tooltip={errorMessage ?? t('common:error.something_went_wrong', 'Something went wrong')}
      >
        {children}
        {shouldRenderPendingInIconBox
          ? <ButtonIconBox><LoadingSpinner size={16} /></ButtonIconBox>
          : <RefreshCcw size={12} />}
      </Button>
    )
  }

  return (
    <Button
      onPress={onPress}
      type={type}
      isDisabled={isPending || isDisabled}
      isPending={shouldRenderPendingInIconBox ? false : isPending}
      tooltip={isError ? (errorMessage ?? tooltip) : tooltip}
    >
      {children}
      {withRenderedIcon({ isPending, isError, action, noIcon, iconBox })}
    </Button>
  )
}
