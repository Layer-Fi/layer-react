import {
  type CSSProperties,
  forwardRef,
  type MutableRefObject,
  type ReactNode,
} from 'react'
import classNames from 'classnames'

import './header.scss'

export interface HeaderProps {
  className?: string
  style?: CSSProperties
  asHeader?: boolean
  sticky?: boolean
  rounded?: boolean
  children: ReactNode
}

const Header = forwardRef<HTMLElement | HTMLDivElement, HeaderProps>(
  ({ className, children, style, sticky, asHeader, rounded }, ref) => {
    const baseClassName = classNames(
      'Layer__HeaderContainer',
      sticky && 'Layer__HeaderContainer--Sticky',
      rounded && 'Layer__HeaderContainer--Rounded',
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

Header.displayName = 'Header'

export { Header }
