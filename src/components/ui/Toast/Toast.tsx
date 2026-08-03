import classNames from 'classnames'

import { type ToastData } from '@internal-types/toast'

import './toast.scss'

export const Toast = ({
  id,
  content,
  isExiting,
  type = 'default',
  onDismiss,
}: ToastData & { isExiting: boolean, onDismiss?: () => void }) => {
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
