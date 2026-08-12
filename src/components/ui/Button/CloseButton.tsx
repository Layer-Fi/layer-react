import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { createLegacyClassNames } from '@utils/shared/styles/legacyClassNames'
import { Button, type ButtonProps } from '@ui/Button/Button'

const legacyClassNames = createLegacyClassNames({
  'state:back': 'Layer__back-btn',
})

type CloseButtonProps = Pick<ButtonProps, 'onPress' | 'aria-label'>

export function CloseButton({ onPress, 'aria-label': ariaLabel }: CloseButtonProps) {
  const { t } = useTranslation()

  return (
    <Button
      variant='outlined'
      icon
      className={legacyClassNames('state:back')}
      onPress={onPress}
      aria-label={ariaLabel ?? t('common:action.close_label', 'Close')}
    >
      <X size={16} />
    </Button>
  )
}
