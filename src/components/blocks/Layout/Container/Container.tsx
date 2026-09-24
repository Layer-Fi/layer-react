import { type CSSProperties, forwardRef, type ReactNode } from 'react'
import classNames from 'classnames'

import { parseStylesFromThemeConfig } from '@utils/shared/styles/colors'
import {
  COMPONENT_CONTAINER_CLASS_NAME,
  COMPONENT_ROOT_CLASS_NAME,
  legacyContainerClassNames,
} from '@utils/shared/styles/componentClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'

export interface ContainerProps {
  name: string
  className?: string
  asWidget?: boolean
  elevated?: boolean
  transparentBg?: boolean
  children: ReactNode
  style?: CSSProperties
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      name,
      className,
      children,
      asWidget,
      elevated = false,
      transparentBg = false,
      style,
    },
    ref,
  ) => {
    const baseClassName = classNames(
      COMPONENT_ROOT_CLASS_NAME,
      COMPONENT_CONTAINER_CLASS_NAME,
      `Layer__${name}`,
      legacyContainerClassNames({ elevated, transparentBg, asWidget }),
      className,
    )

    const { theme } = useLayerContext()

    const themeStyles = parseStylesFromThemeConfig(theme)

    return (
      <div
        ref={ref}
        className={baseClassName}
        {...toDataProperties({ elevated, 'no-bg': transparentBg, 'as-widget': asWidget })}
        style={{ ...themeStyles, ...style }}
      >
        {children}
      </div>
    )
  },
)

Container.displayName = 'Container'

export { Container }
