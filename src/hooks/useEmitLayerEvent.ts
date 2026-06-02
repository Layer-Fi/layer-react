import { useCallback } from 'react'
import { Schema } from 'effect'

import {
  type LayerEvent,
  type LayerEventComponent,
  type LayerEventInput,
  LayerEventSchema,
} from '@providers/LayerProvider/layerEvents'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

// eslint-disable-next-line import/no-relative-parent-imports
import pkg from '../../package.json'

const validateLayerEvent = Schema.validateSync(LayerEventSchema)

/**
 * Returns a stable dispatcher that builds a fully-formed LayerEvent envelope from a
 * `{ type, version, payload }` input — stamping `source`, and `metadata`
 * (component, timestamp, packageVersion) — validates it against the public
 * contract, then forwards it to the consumer's `eventCallbacks.onEvent`.
 *
 * @param component  The embedded Layer surface emitting the event.
 */
export function useEmitLayerEvent(component: LayerEventComponent) {
  const { eventCallbacks } = useLayerContext()

  return useCallback((input: LayerEventInput) => {
    const event = {
      source: 'layer' as const,
      type: input.type,
      version: input.version,
      payload: input.payload,
      metadata: {
        component,
        timestamp: new Date().toISOString(),
        packageVersion: pkg.version,
      },
    }

    // Contract guard: never emit a malformed envelope. This is separate from the
    // consumer-error try/catch in BusinessProvider (which guards the host's handler).
    let validated: LayerEvent
    try {
      validated = validateLayerEvent(event)
    }
    catch (error) {
      console.error('Layer onEvent: dropped malformed event', input.type, error)
      return
    }

    eventCallbacks?.onEvent?.(validated)
  }, [eventCallbacks, component])
}
