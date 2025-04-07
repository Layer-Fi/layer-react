import { ReactNode } from 'react'
import { BackButton } from '../Button/BackButton'
import { toDataProperties } from '../../utils/styleUtils/toDataProperties'
import classNames from 'classnames'
import { createPortal } from 'react-dom'

export type MobilePanelProps = {
  header?: ReactNode
  children: ReactNode
  open?: boolean
  onClose?: () => void
  className?: string
}

export const MobilePanel = ({ header, children, open, onClose, className }: MobilePanelProps) => {
  const dataProperties = toDataProperties({ open })

  return createPortal(
    <div className={classNames('Layer__Portal Layer__mobile-panel', className)} {...dataProperties}>
      <div className='Layer__mobile-panel__header'>
        <BackButton onClick={onClose} />
        {header && (
          <div className='Layer__mobile-panel__header__content'>
            {header}
          </div>
        )}
      </div>
      <div className='Layer__mobile-panel__content'>
        {children}
      </div>
    </div>,
    document.body,
  )
}
