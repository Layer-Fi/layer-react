import { type ReactElement } from 'react'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { type LayerClassName } from '@utils/shared/styles/legacyClassNames'
import { Container } from '@blocks/Layout/Container/Container'
import { DeprecatedHeader } from '@blocks/Layout/DeprecatedHeader/DeprecatedHeader'
import { Header } from '@blocks/Layout/Header/Header'
import { HeaderCol } from '@blocks/Layout/Header/HeaderCol'
import { HeaderRow } from '@blocks/Layout/Header/HeaderRow'
import { LAYOUT_CLASS_NAMES } from '@blocks/Layout/layoutClassNames'
import { Panel } from '@blocks/Layout/View/Panel/Panel'
import { View } from '@blocks/Layout/View/View'

import { LayerTestProvider } from '@testUtils/render/LayerTestProvider'

/*
 * Consumers style against the emitted class names (see the README's "CSS classes"
 * section), so these strings are a public API. New BEM names may come and go; every
 * name in `legacy` has to keep landing on the same element, with the same nesting.
 */

const renderLayout = (ui: ReactElement) =>
  render(ui, { wrapper: LayerTestProvider }).container

const legacyOf = ({ legacy }: LayerClassName) => legacy

const expectLegacyOn = (element: Element | null, name: LayerClassName) => {
  expect(element).not.toBeNull()

  for (const className of legacyOf(name)) {
    expect(element!.classList.contains(className)).toBe(true)
  }
}

const queryLegacy = (root: ParentNode, name: LayerClassName) =>
  root.querySelector(legacyOf(name).map(className => `.${className}`).join(''))

describe('layout legacy class names', () => {
  it('every entry declares at least one legacy name', () => {
    for (const [key, name] of Object.entries(LAYOUT_CLASS_NAMES)) {
      expect(legacyOf(name), key).not.toHaveLength(0)
    }
  })

  describe('View', () => {
    it('emits the view and main classes, with main inside the view', () => {
      const container = renderLayout(<View title='Reports'>body</View>)

      const view = queryLegacy(container, LAYOUT_CLASS_NAMES.VIEW)
      expectLegacyOn(view, LAYOUT_CLASS_NAMES.VIEW)
      expectLegacyOn(queryLegacy(view!, LAYOUT_CLASS_NAMES.VIEW_MAIN), LAYOUT_CLASS_NAMES.VIEW_MAIN)
    })

    it('emits the panel layout modifier alongside the view class', () => {
      const container = renderLayout(<View type='panel'>body</View>)

      expectLegacyOn(
        queryLegacy(container, LAYOUT_CLASS_NAMES.VIEW),
        LAYOUT_CLASS_NAMES.VIEW_PANEL_LAYOUT,
      )
    })

    it('emits the header classes, with actions inside the header content', () => {
      const container = renderLayout(<View title='Reports' header={<button>Export</button>}>body</View>)

      const header = queryLegacy(container, LAYOUT_CLASS_NAMES.VIEW_HEADER)
      expectLegacyOn(header, LAYOUT_CLASS_NAMES.VIEW_HEADER)

      const content = queryLegacy(header!, LAYOUT_CLASS_NAMES.VIEW_HEADER_CONTENT)
      expectLegacyOn(content, LAYOUT_CLASS_NAMES.VIEW_HEADER_CONTENT)
      expectLegacyOn(
        queryLegacy(content!, LAYOUT_CLASS_NAMES.VIEW_HEADER_ACTIONS),
        LAYOUT_CLASS_NAMES.VIEW_HEADER_ACTIONS,
      )
    })
  })

  describe('Panel', () => {
    it('emits the panel and content classes, with content inside the panel', () => {
      const container = renderLayout(<Panel>body</Panel>)

      const panel = queryLegacy(container, LAYOUT_CLASS_NAMES.PANEL)
      expectLegacyOn(panel, LAYOUT_CLASS_NAMES.PANEL)
      expectLegacyOn(
        queryLegacy(panel!, LAYOUT_CLASS_NAMES.PANEL_CONTENT),
        LAYOUT_CLASS_NAMES.PANEL_CONTENT,
      )
    })

    it('emits the sidebar classes and the open modifier', () => {
      const container = renderLayout(
        <Panel sidebarIsOpen sidebar={<nav>sidebar</nav>}>body</Panel>,
      )

      const panel = queryLegacy(container, LAYOUT_CLASS_NAMES.PANEL)
      expectLegacyOn(panel, LAYOUT_CLASS_NAMES.PANEL_OPEN)

      const sidebar = queryLegacy(panel!, LAYOUT_CLASS_NAMES.PANEL_SIDEBAR)
      expectLegacyOn(sidebar, LAYOUT_CLASS_NAMES.PANEL_SIDEBAR)
      expectLegacyOn(
        queryLegacy(sidebar!, LAYOUT_CLASS_NAMES.PANEL_SIDEBAR_CONTENT),
        LAYOUT_CLASS_NAMES.PANEL_SIDEBAR_CONTENT,
      )
    })
  })

  describe('Container', () => {
    it('emits the component and container classes on one element', () => {
      const container = renderLayout(<Container name='journal'>body</Container>)

      const element = queryLegacy(container, LAYOUT_CLASS_NAMES.CONTAINER)
      expectLegacyOn(element, LAYOUT_CLASS_NAMES.CONTAINER)
    })

    it('emits the name-derived class consumers target', () => {
      const container = renderLayout(<Container name='journal'>body</Container>)

      expect(container.querySelector('.Layer__journal')).not.toBeNull()
    })

    it('emits every variant modifier', () => {
      const container = renderLayout(
        <Container name='journal' elevated variant='plain' asWidget>body</Container>,
      )

      const element = queryLegacy(container, LAYOUT_CLASS_NAMES.CONTAINER)
      expectLegacyOn(element, LAYOUT_CLASS_NAMES.CONTAINER_ELEVATED)
      expectLegacyOn(element, LAYOUT_CLASS_NAMES.CONTAINER_PLAIN)
      expectLegacyOn(element, LAYOUT_CLASS_NAMES.CONTAINER_AS_WIDGET)
    })
  })

  describe('panel header', () => {
    it('emits the container, row and col classes, nested', () => {
      const container = renderLayout(
        <Header asHeader sticky rounded>
          <HeaderRow>
            <HeaderCol>title</HeaderCol>
          </HeaderRow>
        </Header>,
      )

      const header = queryLegacy(container, LAYOUT_CLASS_NAMES.PANEL_HEADER)
      expectLegacyOn(header, LAYOUT_CLASS_NAMES.PANEL_HEADER)
      expectLegacyOn(header, LAYOUT_CLASS_NAMES.PANEL_HEADER_STICKY)
      expectLegacyOn(header, LAYOUT_CLASS_NAMES.PANEL_HEADER_ROUNDED)

      const row = queryLegacy(header!, LAYOUT_CLASS_NAMES.PANEL_HEADER_ROW)
      expectLegacyOn(row, LAYOUT_CLASS_NAMES.PANEL_HEADER_ROW)
      expectLegacyOn(
        queryLegacy(row!, LAYOUT_CLASS_NAMES.PANEL_HEADER_COL),
        LAYOUT_CLASS_NAMES.PANEL_HEADER_COL,
      )
    })
  })

  describe('DeprecatedHeader', () => {
    it('emits the legacy component header class', () => {
      const container = renderLayout(<DeprecatedHeader>title</DeprecatedHeader>)

      expectLegacyOn(
        queryLegacy(container, LAYOUT_CLASS_NAMES.DEPRECATED_HEADER),
        LAYOUT_CLASS_NAMES.DEPRECATED_HEADER,
      )
    })
  })
})
