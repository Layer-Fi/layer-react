import React, { ReactNode } from 'react'
import { useLayerContext } from '../../hooks/useLayerContext'
import { parseStylesFromThemeConfig } from '../../utils/colors'

export interface ContainerProps {
  name: string
  className?: string
  children: ReactNode
}

export const Container = ({ name, className, children }: ContainerProps) => {
  const baseClassName = `Layer__${name} ${className ?? ''}`

  const { theme } = useLayerContext()

  const styles = parseStylesFromThemeConfig(theme)

  return (
    <div
      className={`Layer__component Layer__component-container ${baseClassName}`}
      style={{ ...styles }}
    >
      {children}
    </div>
  )
}
