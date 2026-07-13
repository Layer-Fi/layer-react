import { useCallback } from 'react'

import {
  type LayerEvent,
  type LayerEventComponent,
  type LayerEventInput,
} from '@providers/LayerProvider/layerEvents'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

// eslint-disable-next-line import/no-relative-parent-imports
import pkg from '../../package.json'

/**
 * Returns a stable dispatcher that builds a fully-formed LayerEvent envelope from a
 * `{ type, version, payload }` input — stamping `source` and `metadata`
 * (component, timestamp, packageVersion) — then forwards it to the consumer's
 * `eventCallbacks.onEvent`.
 *
 * `LayerEventInput` is a discriminated union, so a mismatched `type`/`version`/`payload`
 * combination is a compile-time error; no runtime validation is needed.
 *
 * @param component  The embedded Layer surface emitting the event.
 */
export function useEmitLayerEvent(component: LayerEventComponent) {
  const { eventCallbacks } = useLayerContext()

  return useCallback((input: LayerEventInput) => {
    const event: LayerEvent = {
      source: 'layer',
      ...input,
      metadata: {
        component,
        timestamp: new Date().toISOString(),
        packageVersion: pkg.version,
      },
    }

    eventCallbacks?.onEvent?.(event)
  }, [eventCallbacks, component])
}
