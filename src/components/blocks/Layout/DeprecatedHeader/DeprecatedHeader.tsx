import { type CSSProperties, forwardRef, type ReactNode } from 'react'

import { withLegacy } from '@utils/shared/styles/legacyClassNames'
import { LAYOUT_CLASS_NAMES } from '@blocks/Layout/layoutClassNames'

import './deprecatedHeader.scss'

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
    return (
      <header
        ref={ref}
        className={withLegacy(LAYOUT_CLASS_NAMES.DEPRECATED_HEADER, className)}
        style={style}
      >
        {children}
      </header>
    )
  },
)

DeprecatedHeader.displayName = 'DeprecatedHeader'

export { DeprecatedHeader }
