import { type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import classNames from 'classnames'

import { toDataProperties } from '@utils/shared/styleUtils/toDataProperties'
import { BackButton } from '@ui/Button/BackButton'

import './tasksMobilePanel.scss'

export type TasksMobilePanelProps = {
  header?: ReactNode
  children: ReactNode
  open?: boolean
  onClose?: () => void
  className?: string
}

export const TasksMobilePanel = ({ header, children, open, onClose, className }: TasksMobilePanelProps) => {
  const dataProperties = toDataProperties({ open })

  return createPortal(
    <div className={classNames('Layer__Portal Layer__TasksMobilePanel', className)} {...dataProperties}>
      <div className='Layer__TasksMobilePanel__Header'>
        <BackButton onPress={onClose} />
        {header && (
          <div className='Layer__TasksMobilePanel__HeaderContent'>
            {header}
          </div>
        )}
      </div>
      <div className='Layer__TasksMobilePanel__Content'>
        {children}
      </div>
    </div>,
    document.body,
  )
}
