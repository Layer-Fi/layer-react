import { useCallback } from 'react'

import type { LayerEvent } from '@providers/LayerProvider/layerEvents'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

/**
 * Returns a stable dispatcher that forwards a `LayerEvent` to the consumer's
 * `eventCallbacks.onEvent` handler, if one was provided to `LayerProvider`.
 *
 * The returned function is referentially stable because `eventCallbacks` is
 * itself stabilized in `BusinessProvider`, so it is safe to use in effect
 * dependency arrays.
 */
export function useEmitLayerEvent() {
  const { eventCallbacks } = useLayerContext()

  return useCallback((event: LayerEvent) => {
    eventCallbacks?.onEvent?.(event)
  }, [eventCallbacks])
}
