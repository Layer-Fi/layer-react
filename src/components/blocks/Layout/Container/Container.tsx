import { forwardRef, type ReactNode } from 'react'

import { parseStylesFromThemeConfig } from '@utils/shared/styles/colors'
import { withLegacy } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { LAYOUT_CLASS_NAMES } from '@blocks/Layout/layoutClassNames'

import './container.scss'

export type ContainerVariant = 'default' | 'plain'
export type ContainerOverflow = 'visible' | 'hidden' | 'auto'

export interface ContainerProps {
  className?: string
  asWidget?: boolean
  elevated?: boolean
  variant?: ContainerVariant
  overflow?: ContainerOverflow
  children: ReactNode
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      className,
      children,
      asWidget,
      elevated = false,
      variant = 'default',
      overflow = 'visible',
    },
    ref,
  ) => {
    const { theme } = useLayerContext()

    const dataProperties = toDataProperties({
      variant,
      overflow,
      'elevated': elevated,
      'as-widget': asWidget,
    })

    return (
      <div
        ref={ref}
        {...dataProperties}
        className={withLegacy(
          LAYOUT_CLASS_NAMES.CONTAINER,
          elevated && LAYOUT_CLASS_NAMES.CONTAINER_ELEVATED.legacy,
          variant === 'plain' && LAYOUT_CLASS_NAMES.CONTAINER_PLAIN.legacy,
          asWidget && LAYOUT_CLASS_NAMES.CONTAINER_AS_WIDGET.legacy,
          className,
        )}
        style={parseStylesFromThemeConfig(theme)}
      >
        {children}
      </div>
    )
  },
)

Container.displayName = 'Container'

export { Container }
