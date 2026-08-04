import { type Meta, type StoryObj } from '@storybook/react-vite'
import type { ExpandedState } from '@tanstack/react-table'

import { ExpandableDataTable } from '@blocks/Table/ExpandableDataTable/ExpandableDataTable'
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

import { Gallery } from '@test-utils/storybook/gallery'

const COLUMN_CONFIG = getAccountColumnConfig()

const EXPANDED_TOP_LEVEL: ExpandedState = { 'assets': true, 'assets.current': true, 'liabilities': true }

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
        <ExpandableDataTableProvider defaultExpanded={EXPANDED_TOP_LEVEL}>
          <Story />
        </ExpandableDataTableProvider>
      </>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof ExpandableDataTable<AccountNode>>

/**
 * A three-level tree, partially expanded — rows indent by depth and are clickable by default,
 * toggling expansion.
 */
export const Default: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: args => (
    <Gallery>
      <ExpandableDataTable {...args} />
    </Gallery>
  ),
}

/**
 * `ExpandableDataTableToggleButton` reads the same provider as the table, so a header control can
 * expand or collapse every row at once. Collapsed here, which `Default` can't also show.
 */
export const WithToggleAll: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  decorators: [
    Story => (
      <>
        <TableStoryStyles />
        <ExpandableDataTableProvider>
          <Story />
        </ExpandableDataTableProvider>
      </>
    ),
  ],
  render: args => (
    <Gallery>
      <ExpandableDataTableToggleButton />
      <ExpandableDataTable {...args} />
    </Gallery>
  ),
}
