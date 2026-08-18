import { useEffect } from 'react'

import { type PublicComponentName } from '@internal-types/shared/componentUsage'
import { useConstant } from '@utils/shared/react/useConstant'
import { describeProps } from '@utils/shared/telemetry/describeProps'
import { enqueueComponentUsage } from '@utils/shared/telemetry/usageLog'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'

/**
 * Queues the props a public component was mounted with, so props nobody passes can be deprecated.
 * Props are read once, at mount — later re-renders are ignored — and only names and shapes are
 * queued, never values. `ComponentUsageReporter` does the sending.
 */
export function useRecordComponentUsage(
  component: PublicComponentName,
  parentComponent: PublicComponentName | null,
  props: object,
) {
  const { businessId } = useLayerContext()
  const loggedProps = useConstant(() => describeProps(props))

  useEffect(() => {
    enqueueComponentUsage({ businessId, component, parentComponent, props: loggedProps })
  }, [businessId, component, parentComponent, loggedProps])
}
