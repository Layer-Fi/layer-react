/**
 * @deprecated- use components/Header instead.
 * This has been kept to not introduce breaking changes.
 */
import { type CSSProperties, forwardRef, type ReactNode } from 'react'
import classNames from 'classnames'

export interface HeaderProps {
  className?: string
  style?: CSSProperties
  children: ReactNode
}

const Header = forwardRef<HTMLElement, HeaderProps>(
  ({ className, children, style }, ref) => {
    const baseClassName = classNames(
      'Layer__component-header',
      className,
    )

    return (
      <header ref={ref} className={baseClassName} style={style}>
        {children}
      </header>
    )
  },
)

Header.displayName = 'Header'

export { Header }
