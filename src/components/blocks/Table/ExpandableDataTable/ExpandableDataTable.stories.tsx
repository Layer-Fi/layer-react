import { type Meta, type StoryObj } from '@storybook/react-vite'
import type { ExpandedState } from '@tanstack/react-table'

import { ExpandableDataTable } from '@blocks/Table/ExpandableDataTable/ExpandableDataTable'
import { ExpandableDataTableProvider } from '@blocks/Table/ExpandableDataTable/ExpandableDataTableProvider'
import { ExpandableDataTableToggleButton } from '@blocks/Table/ExpandableDataTable/ExpandableDataTableToggleButton'

import { Col, Gallery } from '@test-utils/storybook/gallery'
import {
  ACCOUNT_TREE,
  type AccountNode,
  ACCOUNTS_STORY_COMPONENT_NAME,
  getAccountColumnConfig,
  getAccountRowId,
  getAccountSubRows,
  TABLE_STORY_SLOTS,
  TableStoryStyles,
} from '@test-utils/storybook/tableStoryData'

const COLUMN_CONFIG = getAccountColumnConfig()

const PARTIALLY_EXPANDED: ExpandedState = { 'assets': true, 'assets.current': true, 'liabilities': true }

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
 * A three-level tree, partially expanded — rows indent by depth and are clickable by default,
 * toggling expansion — then the same tree collapsed beside `ExpandableDataTableToggleButton`,
 * which reads the same provider to expand or collapse every row at once.
 */
export const Default: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: args => (
    <Gallery gap={32}>
      <Col label='nested rows, partially expanded'>
        <ExpandableDataTableProvider defaultExpanded={PARTIALLY_EXPANDED}>
          <ExpandableDataTable {...args} />
        </ExpandableDataTableProvider>
      </Col>
      <Col label='ExpandableDataTableToggleButton — collapsed, expand or collapse every row at once'>
        <ExpandableDataTableProvider>
          <ExpandableDataTableToggleButton />
          <ExpandableDataTable {...args} />
        </ExpandableDataTableProvider>
      </Col>
    </Gallery>
  ),
}
