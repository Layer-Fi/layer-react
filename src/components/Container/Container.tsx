import React, { ReactNode } from 'react'

export interface ContainerProps {
  name: string
  className?: string
  children: ReactNode
}

export const Container = ({ name, className, children }: ContainerProps) => {
  const baseClassName = `Layer__${name} ${className ?? ''}`

  return (
    <div
      className={`Layer__component Layer__component-container ${baseClassName}`}
    >
      {children}
    </div>
  )
}
