import { ChevronLeft, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { Button, type ButtonProps } from '@ui/Button/Button'

const legacyClassNames = createLegacyClassNames({
  'state:back': 'Layer__back-btn',
})

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
      className={legacyClassNames('state:back')}
      onPress={onPress}
      aria-label={t('common:action.back', 'Back')}
    >
      <Icon size={16} />
    </Button>
  )
}
