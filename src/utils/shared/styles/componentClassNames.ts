import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'

/**
 * The roots every widget shares. They are not owned by one component — `Container` renders them and
 * a handful of sections render them directly — so the composer lives here rather than beside any
 * one element.
 */
const legacyClassNames = createLegacyClassNames({
  'Layer__ComponentRoot': 'Layer__component',
  'Layer__ComponentContainer': 'Layer__component-container',
  'Layer__ComponentHeader': 'Layer__component-header',
  'state:elevated': 'Layer__component--elevated',
  'state:noBg': 'Layer__component--no-bg',
  'state:asWidget': 'Layer__component--as-widget',
} satisfies LegacyClassNameMapFor<
  'Layer__ComponentRoot' | 'Layer__ComponentContainer' | 'Layer__ComponentHeader',
  `state:${string}`
>)

export const COMPONENT_ROOT_CLASS_NAME = legacyClassNames('Layer__ComponentRoot')
export const COMPONENT_CONTAINER_CLASS_NAME = legacyClassNames('Layer__ComponentContainer')
export const COMPONENT_HEADER_CLASS_NAME = legacyClassNames('Layer__ComponentHeader')

type ContainerState = {
  elevated: boolean
  transparentBg: boolean
  asWidget?: boolean
}

export function legacyContainerClassNames({ elevated, transparentBg, asWidget }: ContainerState) {
  return legacyClassNames(
    elevated && 'state:elevated',
    transparentBg && 'state:noBg',
    asWidget && 'state:asWidget',
  )
}
