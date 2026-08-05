import { layerClassName } from '@utils/shared/styles/legacyClassNames'

/**
 * The layout primitives' full class-name contract in one place. `legacy` names are a
 * public API — the README tells consumers to override them — so they keep being emitted
 * on the same element even though no library rule targets them any more.
 *
 * `Layer__component` and `Layer__view` additionally carry the CSS variable declarations
 * in `styles/variables.scss`; dropping either un-defines every token in its subtree.
 *
 * Covered by `legacyClassNames.test.tsx`.
 */
export const LAYOUT_CLASS_NAMES = {
  VIEW: layerClassName('Layer__LayoutView', 'Layer__view'),
  VIEW_PANEL_LAYOUT: layerClassName('', 'Layer__view--panel'),
  VIEW_MAIN: layerClassName('Layer__LayoutView__Main', 'Layer__view-main'),

  VIEW_HEADER: layerClassName('Layer__ViewHeader', 'Layer__view-header'),
  VIEW_HEADER_CONTENT: layerClassName('Layer__ViewHeader__Row', 'Layer__view-header__content'),
  VIEW_HEADER_ACTIONS: layerClassName('Layer__ViewHeader__Actions', 'Layer__view-header__children'),

  PANEL_HEADER: layerClassName('Layer__ViewHeader', 'Layer__HeaderContainer'),
  PANEL_HEADER_STICKY: layerClassName('', 'Layer__HeaderContainer--Sticky'),
  PANEL_HEADER_ROUNDED: layerClassName('', 'Layer__HeaderContainer--Rounded'),
  PANEL_HEADER_ROW: layerClassName('Layer__ViewHeader__Row', 'Layer__HeaderRow'),
  PANEL_HEADER_COL: layerClassName('Layer__ViewHeader__Col', 'Layer__HeaderCol'),

  PANEL: layerClassName('Layer__ViewPanel', 'Layer__panel'),
  PANEL_OPEN: layerClassName('', 'Layer__panel--open'),
  PANEL_CONTENT: layerClassName('Layer__ViewPanel__Content', 'Layer__panel__content'),
  PANEL_SIDEBAR: layerClassName('Layer__ViewPanel__Sidebar', 'Layer__panel__sidebar'),
  PANEL_SIDEBAR_DEFAULT: layerClassName('', 'Layer__panel__sidebar--default'),
  PANEL_SIDEBAR_CONTENT: layerClassName(
    'Layer__ViewPanel__SidebarContent',
    'Layer__panel__sidebar-content',
  ),

  CONTAINER: layerClassName(
    'Layer__LayoutContainer',
    'Layer__component',
    'Layer__component-container',
  ),
  CONTAINER_ELEVATED: layerClassName('', 'Layer__component--elevated'),
  CONTAINER_PLAIN: layerClassName('', 'Layer__component--no-bg'),
  CONTAINER_AS_WIDGET: layerClassName('', 'Layer__component--as-widget'),

  DEPRECATED_HEADER: layerClassName('Layer__DeprecatedHeader', 'Layer__component-header'),
} as const
