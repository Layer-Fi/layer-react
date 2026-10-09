import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { Toast } from '@ui/Toast/Toast'

import './toastsContainer.scss'

const legacyClassNames = createLegacyClassNames({
  Layer__ToastsContainer: 'Layer__toasts-container',
} satisfies LegacyClassNameMapFor<'Layer__ToastsContainer'>)

export function ToastsContainer() {
  const { toasts, removeToast } = useLayerContext()

  return (
    <div className={legacyClassNames('Layer__ToastsContainer')}>
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
