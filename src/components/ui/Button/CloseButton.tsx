import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, type ButtonProps } from '@ui/Button/Button'

type CloseButtonProps = Pick<ButtonProps, 'onPress' | 'aria-label'>

export function CloseButton({ onPress, 'aria-label': ariaLabel }: CloseButtonProps) {
  const { t } = useTranslation()

  return (
    <Button
      variant='outlined'
      icon
      onPress={onPress}
      aria-label={ariaLabel ?? t('common:action.close_label', 'Close')}
    >
      <X size={16} />
    </Button>
  )
}
