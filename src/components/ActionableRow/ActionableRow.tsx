import { type ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@ui/Button/Button'
import { P } from '@ui/Typography/Text'

import './actionableRow.scss'

interface ActionableRowProps {
  icon?: ReactNode
  iconBox?: ReactNode
  title?: string | ReactNode
  description?: string | ReactNode
  button?: ReactNode
  onClick?: () => void
}

const renderIcon = (icon?: ReactNode, iconBox?: ReactNode) => {
  if (iconBox) {
    return iconBox
  }

  if (icon) {
    return <span className='Layer__actionable_row__icon'>{icon}</span>
  }

  return
}

const renderTitle = (title?: string | ReactNode) => {
  if (title && typeof title === 'string') {
    return <P>{title}</P>
  }

  if (title) {
    return title
  }

  return
}

const renderDescription = (description?: string | ReactNode) => {
  if (description && typeof description === 'string') {
    return <P size='sm' variant='subtle'>{description}</P>
  }

  if (description) {
    return description
  }

  return
}

export const ActionableRow = ({
  icon,
  iconBox,
  title,
  description,
  button,
  onClick,
}: ActionableRowProps) => {
  const { t } = useTranslation()

  return (
    <div className='Layer__actionable_row'>
      <div className='Layer__actionable_row__main'>
        {renderIcon(icon, iconBox)}
        <div className='Layer__actionable_row__main__text'>
          {renderTitle(title)}
          {renderDescription(description)}
        </div>
      </div>
      <div className='Layer__actionable_row__action'>
        {button && button}
        {!button && onClick
          ? (
            <Button
              variant='outlined-light'
              icon
              onPress={onClick}
              aria-label={typeof title === 'string' ? title : t('common:action.view_details', 'View details')}
            >
              <ChevronRight size={11} />
            </Button>
          )
          : null}
      </div>
    </div>
  )
}
