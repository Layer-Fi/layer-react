import { useLayerContext } from '../../contexts/LayerContext'
import classNames from 'classnames'

export interface ToastProps {
  id?: string
  content: string
  duration?: number
  isExiting?: boolean
}

const Toast = (props: ToastProps & { isExiting: boolean }) => {
  const { id, content, isExiting } = props
  const { removeToast } = useLayerContext()

  return (
    <div
      id={id}
      className={classNames('Layer__toast', {
        enter: !isExiting,
        exit: isExiting,
      })}
      onClick={() => removeToast(props)}
    >
      <p>{content}</p>
    </div>
  )
}

export function ToastsContainer() {
  const { toasts } = useLayerContext()

  return (
    <div className='Layer__toasts-container'>
      {toasts.map((toast, idx) => (
        <Toast key={`layer-toast-${idx}`} {...toast} />
      ))}
    </div>
  )
}
