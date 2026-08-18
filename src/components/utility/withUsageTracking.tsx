import { type ComponentType, createContext, useContext } from 'react'

import { type PublicComponentName } from '@internal-types/shared/componentUsage'
import { useRecordComponentUsage } from '@hooks/utils/telemetry/useRecordComponentUsage'

const TrackedParentContext = createContext<PublicComponentName | null>(null)

/**
 * Records the props a public component was mounted with. Applied where the component is defined, not
 * in `src/index.tsx`, so the `@layerfi/components/<Name>` subpaths — which re-export from the
 * per-module build — carry the same component as the root entry.
 *
 * A wrapper rather than a hook inside the component because it sees props exactly as the consumer
 * passed them; a hook called after destructuring would record defaults as if they had been passed.
 *
 * Everything reachable from here is deliberately light: it queues, and `ComponentUsageReporter`
 * sends. See `@utils/shared/telemetry/usageLog`.
 */
export function withUsageTracking<TProps extends object>(
  component: PublicComponentName,
  Component: ComponentType<TProps>,
) {
  const TrackedComponent = (props: TProps) => {
    const parentComponent = useContext(TrackedParentContext)

    useRecordComponentUsage(component, parentComponent, props)

    return (
      <TrackedParentContext.Provider value={component}>
        <Component {...props} />
      </TrackedParentContext.Provider>
    )
  }

  TrackedComponent.displayName = `withUsageTracking(${component})`

  return TrackedComponent
}
