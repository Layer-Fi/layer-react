import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, type ButtonProps } from '@ui/Button/Button'

export type BackButtonProps = Pick<ButtonProps, 'onPress'> & {
  slots?: {
    Icon?: React.ComponentType<{ size?: string | number, color?: string }>
  }
}

export function BackButton({ onPress, slots }: BackButtonProps) {
  const { t } = useTranslation()
  const { Icon = ChevronLeft } = slots ?? {}

  return (
    <Button
      variant='outlined'
      icon
      onPress={onPress}
      aria-label={t('common:action.back', 'Back')}
    >
      <Icon size={16} />
    </Button>
  )
}
