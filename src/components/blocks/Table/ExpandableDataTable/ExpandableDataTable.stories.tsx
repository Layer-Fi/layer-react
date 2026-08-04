import { type Meta, type StoryObj } from '@storybook/react-vite'
import type { ExpandedState } from '@tanstack/react-table'

import {
  ExpandableDataTable,
  type ExpandableDataTableIndentSize,
} from '@blocks/Table/ExpandableDataTable/ExpandableDataTable'
import { ExpandableDataTableProvider } from '@blocks/Table/ExpandableDataTable/ExpandableDataTableProvider'
import { ExpandableDataTableToggleButton } from '@blocks/Table/ExpandableDataTable/ExpandableDataTableToggleButton'
import {
  ACCOUNT_TREE,
  type AccountNode,
  ACCOUNTS_STORY_COMPONENT_NAME,
  getAccountColumnConfig,
  getAccountRowId,
  getAccountSubRows,
  TABLE_STORY_SLOTS,
  TableStoryStyles,
} from '@blocks/Table/tableStoryData'

import { Col, Gallery } from '@test-utils/storybook/gallery'

const COLUMN_CONFIG = getAccountColumnConfig()

const EXPANDED_TOP_LEVEL: ExpandedState = { 'assets': true, 'assets.current': true, 'liabilities': true }

const INDENT_SIZES: readonly ExpandableDataTableIndentSize[] = ['xs', 'sm', 'md']

const meta: Meta<typeof ExpandableDataTable<AccountNode>> = {
  title: 'Blocks/Table/ExpandableDataTable',
  component: ExpandableDataTable,
  args: {
    data: ACCOUNT_TREE,
    columnConfig: COLUMN_CONFIG,
    getSubRows: getAccountSubRows,
    getRowId: getAccountRowId,
    componentName: ACCOUNTS_STORY_COMPONENT_NAME,
    ariaLabel: 'Chart of accounts',
    isLoading: false,
    isError: false,
    slots: TABLE_STORY_SLOTS,
  },
  decorators: [
    Story => (
      <>
        <TableStoryStyles />
        <Story />
      </>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof ExpandableDataTable<AccountNode>>

/**
 * A three-level tree under a two-tier header — the `Balance` group in the column config spans three
 * leaf columns — partially expanded, then at each `indentSize`, then fully collapsed beside the
 * toggle button that reads the same provider. Rows are clickable by default, toggling expansion.
 */
export const Default: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: args => (
    <Gallery gap={32}>
      <Col label='grouped header, partially expanded'>
        <ExpandableDataTableProvider defaultExpanded={EXPANDED_TOP_LEVEL}>
          <ExpandableDataTable {...args} />
        </ExpandableDataTableProvider>
      </Col>
      {INDENT_SIZES.map(indentSize => (
        <Col key={indentSize} label={`indentSize="${indentSize}" — per-depth inset, absorbed by the chevron column`}>
          <ExpandableDataTableProvider defaultExpanded>
            <ExpandableDataTable {...args} indentSize={indentSize} />
          </ExpandableDataTableProvider>
        </Col>
      ))}
      <Col label='ExpandableDataTableToggleButton — collapsed, expand or collapse every row at once'>
        <ExpandableDataTableProvider>
          <ExpandableDataTableToggleButton />
          <ExpandableDataTable {...args} />
        </ExpandableDataTableProvider>
      </Col>
    </Gallery>
  ),
}
