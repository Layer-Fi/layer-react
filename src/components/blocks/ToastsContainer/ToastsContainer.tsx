import { useEffect, useState } from 'react'

import { type ToastData } from '@internal-types/shared/toastData'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useLatestRef } from '@hooks/utils/react/useLatestRef'
import { Toast } from '@ui/Toast/Toast'

import './toastsContainer.scss'

const DEFAULT_TOAST_DURATION_MS = 3000
const TOAST_EXIT_DURATION_MS = 1000

type ToastsContainerItemProps = {
  toast: ToastData
  onRemove: () => void
}

const ToastsContainerItem = ({ toast, onRemove }: ToastsContainerItemProps) => {
  const [isExiting, setIsExiting] = useState(false)
  // The provider recreates removeToast every render; reading it through a ref keeps the timers from restarting.
  const onRemoveRef = useLatestRef(onRemove)
  const duration = toast.duration || DEFAULT_TOAST_DURATION_MS

  useEffect(() => {
    const exitTimeout = setTimeout(() => setIsExiting(true), duration)
    const removeTimeout = setTimeout(() => onRemoveRef.current(), duration + TOAST_EXIT_DURATION_MS)

    return () => {
      clearTimeout(exitTimeout)
      clearTimeout(removeTimeout)
    }
  }, [duration, onRemoveRef])

  return <Toast {...toast} isExiting={isExiting} onDismiss={onRemove} />
}

export function ToastsContainer() {
  const { toasts, removeToast } = useLayerContext()

  return (
    <div className='Layer__toasts-container'>
      {toasts.map((toast, idx) => (
        <ToastsContainerItem
          key={toast.id ?? `layer-toast-${idx}`}
          toast={toast}
          onRemove={() => removeToast(toast)}
        />
      ))}
    </div>
  )
}
