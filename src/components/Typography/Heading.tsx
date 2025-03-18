import { ReactNode } from 'react'
import classNames from 'classnames'

export enum HeadingSize {
  primary = 'primary',
  secondary = 'secondary',
  page = 'page',
  view = 'view',
}

export interface HeadingProps {
  as?: React.ElementType
  className?: string
  children: ReactNode
  size?: HeadingSize
  align?: 'left' | 'center' | 'right'
}

export const Heading = ({
  as: Component = 'h2',
  className,
  children,
  size = HeadingSize.primary,
  align = 'center',
}: HeadingProps) => {
  const baseClassName = classNames(
    `Layer__heading Layer__heading--${size}`,
    `Layer__heading--${align}`,
    className,
  )

  return <Component className={baseClassName}>{children}</Component>
}
