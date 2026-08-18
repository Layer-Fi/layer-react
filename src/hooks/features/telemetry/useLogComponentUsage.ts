import { useEffect } from 'react'

import { type PublicComponentName } from '@schemas/common/componentUsage'
import { useConstant } from '@utils/shared/react/useConstant'
import { describeProps, toUsageSignature } from '@utils/shared/telemetry/describeProps'
import { hasAttempted, isWithinSample, markAttempted, recordSampleRate } from '@utils/shared/telemetry/usageLog'
import { useEnvironment } from '@providers/global/Environment/EnvironmentInputProvider'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useAuth } from '@hooks/utils/auth/useAuth'
import { usePostComponentUsage } from '@api/businesses/[business-id]/component-usage/post'

/**
 * Logs the props a public component was mounted with, so props nobody passes can be deprecated.
 * Props are read once, at mount — later re-renders are ignored — and only names and shapes are
 * sent, never values.
 */
export function useLogComponentUsage(
  component: PublicComponentName,
  parentComponent: PublicComponentName | null,
  props: object,
) {
  const { businessId } = useLayerContext()
  const { environment } = useEnvironment()
  const { data: auth } = useAuth()

  const loggedProps = useConstant(() => describeProps(props))
  const { trigger } = usePostComponentUsage()

  const isAuthenticated = Boolean(auth?.access_token)
  const signature = `${businessId}|${parentComponent ?? ''}|${toUsageSignature(component, loggedProps)}`

  useEffect(() => {
    if (!isAuthenticated || hasAttempted(signature)) return

    markAttempted(signature)

    if (!isWithinSample(businessId)) return

    void trigger({ component, parentComponent, environment, props: loggedProps })
      .then((sampleRate) => {
        if (sampleRate !== undefined) recordSampleRate(businessId, sampleRate)
      })
  }, [isAuthenticated, signature, businessId, trigger, component, parentComponent, environment, loggedProps])
}
