import { ReactNode } from 'react'
import ChevronRightIcon from '../../icons/ChevronRight'
import { IconButton } from '../Button'
import { Text } from '../Typography'

type ButtonPosition = 'left' | 'right'

interface ActionableRowProps {
  icon?: ReactNode
  iconBox?: ReactNode
  title?: string | ReactNode
  description?: string | ReactNode
  button?: ReactNode
  onClick?: () => void
  buttonPosition?: ButtonPosition
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
  buttonPosition = 'right',
}: ActionableRowProps) => {
  const actionButton = (
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
  )

  return (
    <div className={`Layer__actionable_row Layer__actionable_row--button-${buttonPosition}`}>
      {buttonPosition === 'left' && actionButton}
      <div className='Layer__actionable_row__main'>
        {renderIcon(icon, iconBox)}
        <div className='Layer__actionable_row__main__text'>
          {renderTitle(title)}
          {renderDescription(description)}
        </div>
      </div>
      {buttonPosition === 'right' && actionButton}
    </div>
  )
}
