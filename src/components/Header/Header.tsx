import React, {
  CSSProperties,
  MutableRefObject,
  ReactNode,
  forwardRef,
} from 'react'
import classNames from 'classnames'

export interface HeaderProps {
  className?: string
  style?: CSSProperties
  asHeader?: boolean
  sticky?: boolean
  rounded?: boolean
  children: ReactNode
}

export const Header = forwardRef<HTMLElement | HTMLDivElement, HeaderProps>(
  ({ className, children, style, sticky, asHeader, rounded }, ref) => {
    const baseClassName = classNames(
      'Layer__header',
      sticky && 'Layer__header--sticky',
      rounded && 'Layer__header--top-rounded',
      className,
    )

    if (asHeader) {
      return (
        <header ref={ref} className={baseClassName} style={style}>
          {children}
        </header>
      )
    }

    return (
      <div
        ref={ref as MutableRefObject<HTMLDivElement>}
        className={baseClassName}
        style={style}
      >
        {children}
      </div>
    )
  },
)
