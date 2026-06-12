import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, type ButtonProps } from '@ui/Button/Button'

type CloseButtonProps = Pick<ButtonProps, 'onPress'>

export function CloseButton({ onPress }: CloseButtonProps) {
  const { t } = useTranslation()

  return (
    <Button
      variant='outlined'
      icon
      onPress={onPress}
      aria-label={t('common:action.close_label', 'Close')}
    >
      <X size={16} />
    </Button>
  )
}
