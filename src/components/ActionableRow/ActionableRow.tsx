import { type ReactNode } from 'react'

import ChevronRightIcon from '@icons/ChevronRight'
import { IconButton } from '@components/Button/IconButton'
import { Text } from '@components/Typography/Text'

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
    return <Text className='Layer__actionable_row__title'>{title}</Text>
  }

  if (title) {
    return title
  }

  return
}

const renderDescription = (description?: string | ReactNode) => {
  if (description && typeof description === 'string') {
    return (
      <Text className='Layer__actionable_row__description'>{description}</Text>
    )
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
            <IconButton
              onClick={onClick}
              icon={<ChevronRightIcon size={11} />}
              withBorder
            />
          )
          : null}
      </div>
    </div>
  )
}
