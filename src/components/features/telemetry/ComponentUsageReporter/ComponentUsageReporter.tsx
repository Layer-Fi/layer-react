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
    // Reports arrive as components mount, so a drain already in flight will pick up the rest.
    if (isDraining.current) return
    isDraining.current = true

    try {
      for (const report of drainComponentUsage(businessId)) {
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
    finally {
      isDraining.current = false
    }
  }, [businessId, environment, trigger])

  const drainRef = useRef(drain)
  useEffect(() => {
    drainRef.current = drain
  }, [drain])

  const wake = useConstant(() => () => {
    void drainRef.current()
  })

  useEffect(() => subscribeToComponentUsage(wake), [wake])

  // Components mount before auth resolves, so their reports wait in the queue until it does.
  useEffect(() => {
    if (isAuthenticated) wake()
  }, [isAuthenticated, wake])

  return null
}
