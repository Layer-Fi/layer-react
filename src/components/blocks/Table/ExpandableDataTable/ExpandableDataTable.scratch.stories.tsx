import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect } from 'storybook/test'

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

import { TABLE_STORY_SLOTS, TableStoryGridStyles } from '@testUtils/storybook/data/tables'
import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

const LEGACY_TABLE_CLASS_NAME = 'Layer__chart-of-accounts__table'

const meta: Meta<typeof ExpandableDataTable<AccountNode>> = {
  title: 'Blocks/Table/ExpandableDataTable (scratch)',
  component: ExpandableDataTable,
  args: {
    data: ACCOUNT_TREE,
    columnConfig: getAccountColumnConfig(),
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
 * The changed state: `className` reaches the rendered table, so the legacy
 * `Layer__chart-of-accounts__table` selector consumers style against matches again.
 */
export const ForwardsClassName: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(`.${LEGACY_TABLE_CLASS_NAME}`)).not.toBeNull()
  },
  render: args => (
    <Gallery gap={32}>
      <Col label={`className='${LEGACY_TABLE_CLASS_NAME}' — forwarded to the table element`}>
        <ExpandableDataTableProvider>
          <ExpandableDataTable {...args} className={LEGACY_TABLE_CLASS_NAME} />
        </ExpandableDataTableProvider>
      </Col>
    </Gallery>
  ),
}

/** The unchanged state: no `className` passed, so no extra name appears on the table. */
export const WithoutClassName: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(`.${LEGACY_TABLE_CLASS_NAME}`)).toBeNull()
  },
  render: args => (
    <Gallery gap={32}>
      <Col label='no className — baseline'>
        <ExpandableDataTableProvider>
          <ExpandableDataTable {...args} />
        </ExpandableDataTableProvider>
      </Col>
    </Gallery>
  ),
}
