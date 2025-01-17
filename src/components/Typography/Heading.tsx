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
}

export const Heading = ({
  as: Component = 'h2',
  className,
  children,
  size = HeadingSize.primary,
}: HeadingProps) => {
  const baseClassName = classNames(
    `Layer__heading Layer__heading--${size}`,
    className,
  )

  return <Component className={baseClassName}>{children}</Component>
}
