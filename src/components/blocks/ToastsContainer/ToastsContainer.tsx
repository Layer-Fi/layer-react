import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { Toast } from '@ui/Toast/Toast'

import './toastsContainer.scss'

export function ToastsContainer() {
  const { toasts, removeToast } = useLayerContext()

  return (
    <div className='Layer__toasts-container'>
      {toasts.map((toast, idx) => (
        <Toast
          key={toast.id ?? `layer-toast-${idx}`}
          {...toast}
          onDismiss={() => removeToast(toast)}
        />
      ))}
    </div>
  )
}
