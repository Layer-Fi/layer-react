import React, { CSSProperties, ReactNode, forwardRef } from 'react'
import { useLayerContext } from '../../hooks/useLayerContext'
import { parseStylesFromThemeConfig } from '../../utils/colors'
import classNames from 'classnames'

export interface ContainerProps {
  name: string
  className?: string
  asWidget?: boolean
  elevated?: boolean
  children: ReactNode
  style?: CSSProperties
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ name, className, children, asWidget, elevated = false, style }, ref) => {
    const baseClassName = classNames(
      'Layer__component Layer__component-container',
      `Layer__${name}`,
      elevated && 'Layer__component--elevated',
      asWidget && 'Layer__component--as-widget',
      className,
    )

    const { theme } = useLayerContext()

    const styles = parseStylesFromThemeConfig(theme)

    return (
      <div ref={ref} className={baseClassName} style={{ ...styles, ...style }}>
        {children}
      </div>
    )
  },
)
