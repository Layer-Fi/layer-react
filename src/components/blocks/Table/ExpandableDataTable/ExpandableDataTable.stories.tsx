import { type Meta, type StoryObj } from '@storybook/react-vite'
import type { ExpandedState } from '@tanstack/react-table'

import { ExpandableDataTable } from '@blocks/Table/ExpandableDataTable/ExpandableDataTable'
import {
  ACCOUNT_TREE,
  type AccountNode,
  ACCOUNTS_STORY_COLUMNS,
  ACCOUNTS_STORY_COMPONENT_NAME,
  getAccountColumnConfig,
  getAccountRowId,
  getAccountSubRows,
} from '@blocks/Table/ExpandableDataTable/ExpandableDataTable.storyData'
import { ExpandableDataTableProvider } from '@blocks/Table/ExpandableDataTable/ExpandableDataTableProvider'
import { ExpandableDataTableToggleButton } from '@blocks/Table/ExpandableDataTable/ExpandableDataTableToggleButton'

import { TABLE_STORY_SLOTS, TableStoryGridStyles } from '@testUtils/storybook/data/tables'
import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

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
        <TableStoryGridStyles componentName={ACCOUNTS_STORY_COMPONENT_NAME} columns={ACCOUNTS_STORY_COLUMNS} />
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
