import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { Toast } from '@ui/Toast/Toast'

export function ToastsContainer() {
  const { toasts, removeToast } = useLayerContext()

  return (
    <div className='Layer__toasts-container'>
      {toasts.map((toast, idx) => (
        <Toast
          key={`layer-toast-${idx}`}
          {...toast}
          onDismiss={() => removeToast(toast)}
        />
      ))}
    </div>
  )
}
