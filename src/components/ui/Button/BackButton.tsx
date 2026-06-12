import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button, type ButtonProps } from '@ui/Button/Button'

type BackButtonProps = Pick<ButtonProps, 'onPress'>

export function BackButton({ onPress }: BackButtonProps) {
  const { t } = useTranslation()

  return (
    <Button
      variant='outlined'
      icon
      onPress={onPress}
      aria-label={t('common:action.back', 'Back')}
    >
      <ChevronLeft size={16} />
    </Button>
  )
}
