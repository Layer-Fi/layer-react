import { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import classNames from 'classnames'

export interface FullPageDrawerProps {
  children: ReactNode
  className?: string
}

export const FullPageDrawer = ({
  children,
  className,
}: FullPageDrawerProps) => {
  return createPortal(
    <div
      className={classNames('Layer__full-page-drawer', className)}
      role='dialog'
      aria-modal='true'
    >
      {children}
    </div>,
    document.body,
  )
}