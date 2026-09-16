import { type Meta, type StoryObj } from '@storybook/react-vite'

import { PaginatedTable } from '@blocks/Table/PaginatedDataTable/PaginatedDataTable'
import {
  getPinnedCustomerColumnConfig,
  PINNED_STORY_COLUMNS,
  PINNED_STORY_COMPONENT_NAME,
} from '@blocks/Table/PaginatedDataTable/PaginatedDataTable.storyData'

import {
  buildCustomerRows,
  type CustomerRow,
  getCustomerColumnConfig,
  TABLE_STORY_COMPONENT_NAME,
  TABLE_STORY_SLOTS,
  TableStoryGridStyles,
  TableStoryStyles,
} from '@testUtils/storybook/data/tables'
import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

const COLUMN_CONFIG = getCustomerColumnConfig()
const PINNED_COLUMN_CONFIG = getPinnedCustomerColumnConfig()
const ROWS = buildCustomerRows(43)

const meta: Meta<typeof PaginatedTable<CustomerRow>> = {
  title: 'Blocks/Table/PaginatedDataTable',
  component: PaginatedTable,
  args: {
    data: ROWS,
    columnConfig: COLUMN_CONFIG,
    componentName: TABLE_STORY_COMPONENT_NAME,
    ariaLabel: 'Customers',
    isLoading: false,
    isError: false,
    slots: TABLE_STORY_SLOTS,
    paginationProps: { pageSize: 8 },
  },
  decorators: [
    Story => (
      <>
        <TableStoryStyles />
        <TableStoryGridStyles componentName={PINNED_STORY_COMPONENT_NAME} columns={PINNED_STORY_COLUMNS} />
        <Story />
      </>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof PaginatedTable<CustomerRow>>

/**
 * 43 rows behind the pager the table renders for you, then the same table with ten columns and
 * pinning — `No.` frozen left, `Status` and the action column frozen right, the rest scrolling.
 */
export const Default: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: args => (
    <Gallery gap={32}>
      <Col label='paginationProps — 8 rows per page'>
        <PaginatedTable {...args} />
      </Col>
      <Col label='pinning — left and right columns frozen while the middle scrolls'>
        <PaginatedTable
          {...args}
          columnConfig={PINNED_COLUMN_CONFIG}
          componentName={PINNED_STORY_COMPONENT_NAME}
          paginationProps={{ pageSize: 6 }}
        />
      </Col>
    </Gallery>
  ),
}
