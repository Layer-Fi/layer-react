import React, { ReactNode } from 'react'
import classNames from 'classnames'

export enum TextSize {
  md = 'md',
  sm = 'sm',
}

export enum TextWeight {
  normal = 'normal',
  bold = 'bold',
}

export interface TextProps {
  as?: React.ElementType
  className?: string
  children: ReactNode
  size?: TextSize
  weight?: TextWeight
}

export const Text = ({
  as: Component = 'p',
  className,
  children,
  size = TextSize.md,
  weight = TextWeight.normal,
}: TextProps) => {
  const baseClassName = classNames(
    `Layer__text Layer__text--${size} Layer__text--${weight}`,
    className,
  )

  return <Component className={baseClassName}>{children}</Component>
}
