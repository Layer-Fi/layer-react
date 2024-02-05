import React, { ReactNode } from 'react'
import { useLayerContext } from '../../hooks/useLayerContext'
import { parseStylesFromThemeConfig } from '../../utils/colors'
import classNames from 'classnames'

export interface ContainerProps {
  name: string
  className?: string
  asWidget?: boolean
  children: ReactNode
}

export const Container = ({
  name,
  className,
  children,
  asWidget,
}: ContainerProps) => {
  const baseClassName = classNames(
    'Layer__component Layer__component-container',
    `Layer__${name}`,
    asWidget ? 'Layer__component--as-widget' : '',
    className,
  )

  const { theme } = useLayerContext()

  const styles = parseStylesFromThemeConfig(theme)

  return (
    <div className={baseClassName} style={{ ...styles }}>
      {children}
    </div>
  )
}
