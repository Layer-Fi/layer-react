import { type ReactNode } from 'react'

import { withLegacy } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { LAYOUT_CLASS_NAMES } from '@blocks/Layout/layoutClassNames'

import './panel.scss'

export type PanelSidebarVariant = 'default' | 'plain'

export interface PanelProps {
  children: ReactNode
  className?: string
  sidebar?: ReactNode
  sidebarIsOpen?: boolean
  /** `plain` drops the sidebar's own border and background. */
  sidebarVariant?: PanelSidebarVariant
  /** Let the sidebar fill the panel rather than sitting in a fixed-width track. */
  fullWidthSidebar?: boolean
  header?: ReactNode
  rounded?: boolean
}

export const Panel = ({
  children,
  className,
  sidebar,
  header,
  sidebarIsOpen = false,
  sidebarVariant = 'default',
  fullWidthSidebar = false,
  rounded = false,
}: PanelProps) => (
  <div
    {...toDataProperties({
      'rounded': rounded,
      'sidebar': sidebarIsOpen ? 'open' : 'closed',
      'full-width-sidebar': fullWidthSidebar,
    })}
    className={withLegacy(
      LAYOUT_CLASS_NAMES.PANEL,
      sidebarIsOpen && LAYOUT_CLASS_NAMES.PANEL_OPEN.legacy,
      className,
    )}
  >
    <div className={withLegacy(LAYOUT_CLASS_NAMES.PANEL_CONTENT)}>
      {header}
      {children}
    </div>
    {sidebar && (
      <div
        {...toDataProperties({ variant: sidebarVariant })}
        className={withLegacy(
          LAYOUT_CLASS_NAMES.PANEL_SIDEBAR,
          fullWidthSidebar && LAYOUT_CLASS_NAMES.PANEL_SIDEBAR_DEFAULT.legacy,
        )}
      >
        <div className={withLegacy(LAYOUT_CLASS_NAMES.PANEL_SIDEBAR_CONTENT)}>{sidebar}</div>
      </div>
    )}
  </div>
)
