import classNames from 'classnames'

import { type ToastData } from '@internal-types/shared/toastData'

import './toast.scss'

export type ToastProps = ToastData & {
  isExiting: boolean
  onDismiss?: () => void
}

export const Toast = ({
  id,
  content,
  isExiting,
  type = 'default',
  onDismiss,
}: ToastProps) => {
  return (
    <div
      id={id}
      className={classNames('Layer__toast', {
        enter: !isExiting,
        exit: isExiting,
      }, `Layer__toast--${type}`)}
      onClick={onDismiss}
    >
      <p>{content}</p>
    </div>
  )
}
