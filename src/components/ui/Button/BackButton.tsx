import { ChevronLeft, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, type ButtonProps } from '@ui/Button/Button'
import { LEGACY_BACK_BUTTON_CLASS_NAME } from '@ui/Button/legacyClassNames'

export type BackButtonProps = Pick<ButtonProps, 'onPress'> & {
  slots?: {
    Icon?: LucideIcon
  }
}

export function BackButton({ onPress, slots }: BackButtonProps) {
  const { t } = useTranslation()
  const { Icon = ChevronLeft } = slots ?? {}

  return (
    <Button
      variant='outlined'
      icon
      className={LEGACY_BACK_BUTTON_CLASS_NAME}
      onPress={onPress}
      aria-label={t('common:action.back', 'Back')}
    >
      <Icon size={16} />
    </Button>
  )
}
