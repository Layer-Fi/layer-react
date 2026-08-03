import { type CSSProperties, forwardRef, type ReactNode } from 'react'
import classNames from 'classnames'

export interface DeprecatedHeaderProps {
  className?: string
  style?: CSSProperties
  children: ReactNode
}

/**
 * @deprecated Use `Header` from `@blocks/Layout/Header/Header` instead. Kept because it
 * emits `Layer__component-header`, which consumers may style against.
 */
const DeprecatedHeader = forwardRef<HTMLElement, DeprecatedHeaderProps>(
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

DeprecatedHeader.displayName = 'DeprecatedHeader'

export { DeprecatedHeader }
