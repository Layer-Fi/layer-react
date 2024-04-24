import React, { ReactNode, forwardRef } from 'react'
import { useLayerContext } from '../../hooks/useLayerContext'
import { parseStylesFromThemeConfig } from '../../utils/colors'
import classNames from 'classnames'

export interface ContainerProps {
  name: string
  className?: string
  asWidget?: boolean
  asContainer?: boolean
  children: ReactNode
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ name, className, children, asWidget, asContainer = true }, ref) => {
    const baseClassName = classNames(
      'Layer__component',
      `Layer__${name}`,
      asContainer && 'Layer__component-container',
      asWidget && 'Layer__component--as-widget',
      className,
    )

    const { theme } = useLayerContext()

    const styles = parseStylesFromThemeConfig(theme)

    return (
      <div ref={ref} className={baseClassName} style={{ ...styles }}>
        {children}
      </div>
    )
  },
)
