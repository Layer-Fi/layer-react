import { useCallback, useEffect, useRef } from 'react'

import { useConstant } from '@utils/shared/react/useConstant'
import {
  drainComponentUsage,
  isWithinSample,
  recordSampleRate,
  subscribeToComponentUsage,
} from '@utils/shared/telemetry/usageLog'
import { useEnvironment } from '@providers/global/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { usePostComponentUsage } from '@api/businesses/[business-id]/component-usage/post'

/**
 * Sends the prop-usage reports that tracked components queue on mount. Mounted once per
 * `LayerProvider`, so the data-loading layer stays out of every component's import graph — see
 * `@utils/shared/telemetry/usageLog`. Renders nothing.
 */
export const ComponentUsageReporter = () => {
  const { businessId } = useLayerContext()
  const { environment } = useEnvironment()
  const { data: auth } = useAuth()
  const { trigger } = usePostComponentUsage()

  const isAuthenticated = Boolean(auth?.access_token)
  const isDraining = useRef(false)

  const drain = useCallback(async () => {
    // Components mount before auth resolves. Their reports stay queued — the effect below drains them
    // once a token lands — because SWR rejects a trigger whose key is not ready yet.
    if (!isAuthenticated || isDraining.current) return
    isDraining.current = true

    try {
      // Re-drained until empty: a component mounting while a request is in flight enqueues after this
      // drain took its batch, and its wake-up is swallowed by the guard above. Nothing else would come
      // back for it.
      for (let batch = drainComponentUsage(businessId); batch.length > 0; batch = drainComponentUsage(businessId)) {
        for (const report of batch) {
          if (!isWithinSample(businessId)) continue

          const sampleRate = await trigger({
            component: report.component,
            parentComponent: report.parentComponent,
            environment,
            props: report.props,
          })

          if (sampleRate !== undefined) recordSampleRate(businessId, sampleRate)
        }
      }
    }
    finally {
      isDraining.current = false
    }
  }, [isAuthenticated, businessId, environment, trigger])

  const drainRef = useRef(drain)
  useEffect(() => {
    drainRef.current = drain
  }, [drain])

  const wake = useConstant(() => () => {
    // A token expiring mid-drain makes SWR reject on a missing key. Telemetry must never surface as an
    // unhandled rejection in a consumer's app.
    void drainRef.current().catch(() => undefined)
  })

  useEffect(() => subscribeToComponentUsage(wake), [wake])

  useEffect(() => {
    if (isAuthenticated) wake()
  }, [isAuthenticated, wake])

  return null
}
