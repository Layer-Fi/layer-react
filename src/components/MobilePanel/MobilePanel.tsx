import { type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import classNames from 'classnames'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { BackButton } from '@components/Button/BackButton'

import './mobilePanel.scss'

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
