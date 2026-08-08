import { forwardRef, type ReactNode, type Ref } from 'react'

import { type LayerClassName, withLegacy } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { Heading } from '@ui/Typography/Heading'
import { LAYOUT_CLASS_NAMES } from '@blocks/Layout/layoutClassNames'

import './viewHeader.scss'

/**
 * `view` sits at the top of a `View` - one bottom border, view padding, content capped
 * at the max content width. `panel` sits inside a `Container` or `ViewPanel` and can
 * stick to the top of the scroll area.
 *
 * The surface also picks which legacy class names are emitted: the two families never
 * coexisted on an element, so a consumer rule for one must not start hitting the other.
 */
export type ViewHeaderSurface = 'view' | 'panel'

type SurfaceClassNames = {
  Root: LayerClassName
  Row: LayerClassName
  Title: LayerClassName
  Col: LayerClassName
}

const SURFACE_CLASS_NAMES: Record<ViewHeaderSurface, SurfaceClassNames> = {
  view: {
    Root: LAYOUT_CLASS_NAMES.VIEW_HEADER,
    Row: LAYOUT_CLASS_NAMES.VIEW_HEADER_ROW,
    Title: LAYOUT_CLASS_NAMES.VIEW_HEADER_TITLE,
    Col: LAYOUT_CLASS_NAMES.VIEW_HEADER_ACTIONS,
  },
  panel: {
    Root: LAYOUT_CLASS_NAMES.PANEL_HEADER,
    Row: LAYOUT_CLASS_NAMES.PANEL_HEADER_ROW,
    Title: LAYOUT_CLASS_NAMES.PANEL_HEADER_TITLE,
    Col: LAYOUT_CLASS_NAMES.PANEL_HEADER_COL,
  },
}

export type ViewHeaderSlots = {
  /** Start of the first row - a heading, a breadcrumb, a back button and label. */
  Title?: ReactNode
  /** End of the first row. */
  Actions?: ReactNode
  /** Start of the second row. Supplying either filter slot is what renders it. */
  Filters?: ReactNode
  /** End of the second row. */
  FilterActions?: ReactNode
}

export interface ViewHeaderProps {
  surface?: ViewHeaderSurface
  /** Convenience for the common case; renders into the `Title` slot. */
  title?: string
  className?: string
  /** Render as `<header>` rather than `<div>`. */
  asHeader?: boolean
  sticky?: boolean
  rounded?: boolean
  /** Let the title fill the row instead of sitting beside the actions. */
  fluid?: boolean
  /** `none` runs the header flush to the edge, for a view whose body is a panel. */
  padding?: 'default' | 'none'
  slots?: ViewHeaderSlots
}

const ViewHeader = forwardRef<HTMLElement, ViewHeaderProps>(
  (
    {
      surface = 'view',
      title,
      className,
      asHeader = false,
      sticky = false,
      rounded = false,
      fluid = false,
      padding = 'default',
      slots,
    },
    ref,
  ) => {
    const { Title, Actions, Filters, FilterActions } = slots ?? {}
    const surfaceClassNames = SURFACE_CLASS_NAMES[surface]

    const titleContent = Title ?? (title
      ? <Heading level={2} size={surface === 'view' ? 'lg' : 'md'}>{title}</Heading>
      : null)

    const rootProps = {
      ...toDataProperties({ surface, padding, sticky, rounded }),
      className: withLegacy(
        surfaceClassNames.Root,
        sticky && LAYOUT_CLASS_NAMES.PANEL_HEADER_STICKY.legacy,
        rounded && LAYOUT_CLASS_NAMES.PANEL_HEADER_ROUNDED.legacy,
        className,
      ),
    }

    const children = (
      <>
        {(titleContent || Actions) && (
          <div
            {...toDataProperties({ row: 'title' })}
            className={withLegacy(surfaceClassNames.Row)}
          >
            {titleContent && (
              <div
                {...toDataProperties({ fluid })}
                className={withLegacy(surfaceClassNames.Title)}
              >
                {titleContent}
              </div>
            )}
            {Actions && <div className={withLegacy(surfaceClassNames.Col)}>{Actions}</div>}
          </div>
        )}
        {(Filters || FilterActions) && (
          <div
            {...toDataProperties({ row: 'filters' })}
            className={withLegacy(surfaceClassNames.Row)}
          >
            {Filters && <div className={withLegacy(surfaceClassNames.Col)}>{Filters}</div>}
            {FilterActions && (
              <div className={withLegacy(surfaceClassNames.Col)}>{FilterActions}</div>
            )}
          </div>
        )}
      </>
    )

    if (asHeader) {
      return <header ref={ref} {...rootProps}>{children}</header>
    }

    return <div ref={ref as Ref<HTMLDivElement>} {...rootProps}>{children}</div>
  },
)

ViewHeader.displayName = 'ViewHeader'

export { ViewHeader }
