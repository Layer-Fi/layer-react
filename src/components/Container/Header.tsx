/**
 * @deprecated- use components/Header instead.
 * This has been kept to not introduce breaking changes.
 */
import React, { CSSProperties, ReactNode, forwardRef } from 'react'
import classNames from 'classnames'

export enum HeaderLayout {
  DEFAULT = 'default',
  NEXT_LINE_ACTIONS = 'next-line-actions',
}

export interface HeaderProps {
  className?: string
  style?: CSSProperties
  children: ReactNode
  layout?: HeaderLayout
}

export const Header = forwardRef<HTMLElement, HeaderProps>(
  ({ className, children, style, layout }, ref) => {
    const baseClassName = classNames(
      'Layer__component-header',
      layout && `Layer__component-header--${layout}`,
      className,
    )

    return (
      <header ref={ref} className={baseClassName} style={style}>
        {children}
      </header>
    )
  },
)
