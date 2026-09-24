import { type CSSProperties, forwardRef, type ReactNode } from 'react'
import classNames from 'classnames'

import { COMPONENT_HEADER_CLASS_NAME } from '@utils/shared/styles/componentClassNames'
export interface DeprecatedHeaderProps {
  className?: string
  style?: CSSProperties
  children: ReactNode
}

/**
 * @deprecated Use `Header` from `@blocks/Layout/Header/Header` instead. Kept because it
 * emits `Layer__ComponentHeader`, which consumers may style against.
 */
const DeprecatedHeader = forwardRef<HTMLElement, DeprecatedHeaderProps>(
  ({ className, children, style }, ref) => {
    const baseClassName = classNames(
      COMPONENT_HEADER_CLASS_NAME,
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
